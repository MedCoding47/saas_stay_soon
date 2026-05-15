using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Adoptions;
using PawFinds.Application.Common;
using PawFinds.Application.MultiTenancy;
using PawFinds.Application.Notifications;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Adoptions;

public sealed class AdoptionService : IAdoptionService
{
    private static readonly IReadOnlyDictionary<AdoptionStatus, AdoptionStatus[]> AllowedTransitions =
        new Dictionary<AdoptionStatus, AdoptionStatus[]>
        {
            [AdoptionStatus.Available] = [AdoptionStatus.ApplicationReceived],
            [AdoptionStatus.ApplicationReceived] = [AdoptionStatus.UnderReview],
            [AdoptionStatus.UnderReview] = [AdoptionStatus.Approved],
            [AdoptionStatus.Approved] = [AdoptionStatus.Completed],
            [AdoptionStatus.Completed] = []
        };

    private readonly AppDbContext _dbContext;
    private readonly INotificationService _notificationService;
    private readonly ITenantService _tenantService;

    public AdoptionService(
        AppDbContext dbContext,
        INotificationService notificationService,
        ITenantService tenantService)
    {
        _dbContext = dbContext;
        _notificationService = notificationService;
        _tenantService = tenantService;
    }

    public async Task<IReadOnlyList<AdoptionDto>> GetAdoptionsAsync(
        CancellationToken cancellationToken)
    {
        EnsureTenant();

        return await _dbContext.Adoptions
            .AsNoTracking()
            .OrderByDescending(adoption => adoption.CreatedAt)
            .Select(adoption => new AdoptionDto(
                adoption.Id,
                adoption.OrganizationId,
                adoption.PetId,
                adoption.AdopterId,
                adoption.Status,
                adoption.ApplicationMessage,
                adoption.AdminNotes,
                adoption.CompletedAt,
                adoption.CreatedAt,
                adoption.UpdatedAt,
                adoption.Adopter != null ? adoption.Adopter.ProfilePictureUrl : null))
            .ToListAsync(cancellationToken);
    }

    public async Task<PagedResult<AdoptionDto>> GetAdoptionsPagedAsync(
        GetAdoptionsRequest request,
        CancellationToken cancellationToken)
    {
        EnsureTenant();

        var query = _dbContext.Adoptions.AsNoTracking();

        if (request.Status.HasValue)
        {
            query = query.Where(adoption => adoption.Status == request.Status);
        }

        if (request.PetId.HasValue)
        {
            query = query.Where(adoption => adoption.PetId == request.PetId);
        }

        if (request.AdopterId.HasValue)
        {
            query = query.Where(adoption => adoption.AdopterId == request.AdopterId);
        }

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalCount / request.PageSize);

        var items = await query
            .OrderByDescending(adoption => adoption.CreatedAt)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(adoption => new AdoptionDto(
                adoption.Id,
                adoption.OrganizationId,
                adoption.PetId,
                adoption.AdopterId,
                adoption.Status,
                adoption.ApplicationMessage,
                adoption.AdminNotes,
                adoption.CompletedAt,
                adoption.CreatedAt,
                adoption.UpdatedAt,
                adoption.Adopter != null ? adoption.Adopter.ProfilePictureUrl : null))
            .ToListAsync(cancellationToken);

        return new PagedResult<AdoptionDto>(
            items,
            request.Page,
            request.PageSize,
            totalCount,
            totalPages);
    }

    public async Task<AdoptionDto> CreateApplicationAsync(
        CreateAdoptionRequest request,
        CancellationToken cancellationToken)
    {
        var organizationId = EnsureTenant();

        var pet = await _dbContext.Pets
            .FirstOrDefaultAsync(pet => pet.Id == request.PetId, cancellationToken);

        if (pet is null)
        {
            throw new AdoptionWorkflowException("Pet was not found for the current organization.");
        }

        if (pet.Status != AdoptionStatus.Available)
        {
            throw new AdoptionWorkflowException("This pet is not available for adoption.");
        }

        var adopter = await _dbContext.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(user => user.Id == request.AdopterId, cancellationToken);

        if (adopter is null)
        {
            throw new AdoptionWorkflowException("Adopter was not found for the current organization.");
        }

        var adoption = new Adoption
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            PetId = request.PetId,
            AdopterId = request.AdopterId,
            Status = AdoptionStatus.ApplicationReceived,
            ApplicationMessage = NormalizeOptional(request.ApplicationMessage)
        };

        pet.Status = AdoptionStatus.ApplicationReceived;

        _dbContext.Adoptions.Add(adoption);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AdoptionDto(
            adoption.Id, adoption.OrganizationId, adoption.PetId, adoption.AdopterId,
            adoption.Status, adoption.ApplicationMessage, adoption.AdminNotes,
            adoption.CompletedAt, adoption.CreatedAt, adoption.UpdatedAt,
            adopter.ProfilePictureUrl);
    }

    public async Task<AdoptionDto?> TransitionAsync(
        Guid adoptionId,
        TransitionAdoptionRequest request,
        CancellationToken cancellationToken)
    {
        EnsureTenant();

        var adoption = await _dbContext.Adoptions
            .Include(adoption => adoption.Pet)
            .Include(adoption => adoption.Adopter)
            .FirstOrDefaultAsync(adoption => adoption.Id == adoptionId, cancellationToken);

        if (adoption is null)
        {
            return null;
        }

        if (!CanTransition(adoption.Status, request.Status))
        {
            throw new AdoptionWorkflowException(
                $"Invalid adoption transition from {adoption.Status} to {request.Status}.");
        }

        var newStatus = request.Status;

        if (newStatus == AdoptionStatus.Approved)
        {
            await ApproveAsync(adoption, cancellationToken);
        }
        else if (newStatus == AdoptionStatus.Completed)
        {
            Complete(adoption);
        }
        else
        {
            adoption.Status = newStatus;

            if (adoption.Pet is not null)
            {
                adoption.Pet.Status = newStatus;
            }
        }

        adoption.AdminNotes = NormalizeOptional(request.AdminNotes);
        _notificationService.AddAdoptionStatusChangedNotification(adoption, newStatus);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return new AdoptionDto(
            adoption.Id, adoption.OrganizationId, adoption.PetId, adoption.AdopterId,
            adoption.Status, adoption.ApplicationMessage, adoption.AdminNotes,
            adoption.CompletedAt, adoption.CreatedAt, adoption.UpdatedAt,
            adoption.Adopter?.ProfilePictureUrl);
    }

    public bool CanTransition(
        AdoptionStatus currentStatus,
        AdoptionStatus nextStatus)
    {
        return AllowedTransitions.TryGetValue(currentStatus, out var allowed)
            && allowed.Contains(nextStatus);
    }

    private async Task ApproveAsync(
        Adoption adoption,
        CancellationToken cancellationToken)
    {
        var hasLockedAdoption = await _dbContext.Adoptions
            .AnyAsync(
                otherAdoption =>
                    otherAdoption.Id != adoption.Id
                    && otherAdoption.PetId == adoption.PetId
                    && (otherAdoption.Status == AdoptionStatus.Approved
                        || otherAdoption.Status == AdoptionStatus.Completed),
                cancellationToken);

        if (hasLockedAdoption)
        {
            throw new AdoptionWorkflowException("This pet already has an approved or completed adoption.");
        }

        adoption.Status = AdoptionStatus.Approved;

        if (adoption.Pet is not null)
        {
            adoption.Pet.Status = AdoptionStatus.Approved;
        }
    }

    private static void Complete(Adoption adoption)
    {
        adoption.Status = AdoptionStatus.Completed;
        adoption.CompletedAt = DateTimeOffset.UtcNow;

        if (adoption.Pet is not null)
        {
            adoption.Pet.Status = AdoptionStatus.Completed;
        }
    }

    private Guid EnsureTenant()
    {
        return _tenantService.OrganizationId
            ?? throw new UnauthorizedAccessException("Organization context is missing.");
    }

    private static string? NormalizeOptional(string? value)
    {
        return string.IsNullOrWhiteSpace(value) ? null : value.Trim();
    }

}
