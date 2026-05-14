using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Common;
using PawFinds.Application.MultiTenancy;
using PawFinds.Application.Pets;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Pets;

public sealed class PetService : IPetService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public PetService(AppDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<PagedResult<PetDto>> GetPetsAsync(
        PetQueryParameters query,
        CancellationToken cancellationToken)
    {
        var petsQuery = _dbContext.Pets.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(query.Type))
        {
            petsQuery = petsQuery.Where(pet => pet.Type == query.Type);
        }

        if (!string.IsNullOrWhiteSpace(query.Location))
        {
            petsQuery = petsQuery.Where(pet => pet.Location == query.Location);
        }

        if (query.Status.HasValue)
        {
            petsQuery = petsQuery.Where(pet => pet.Status == query.Status.Value);
        }

        var totalCount = await petsQuery.CountAsync(cancellationToken);

        var pets = await petsQuery
            .OrderByDescending(pet => pet.CreatedAt)
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(pet => ToDto(pet))
            .ToListAsync(cancellationToken);

        var totalPages = (int)Math.Ceiling((double)totalCount / query.PageSize);

        return new PagedResult<PetDto>(
            pets,
            query.PageNumber,
            query.PageSize,
            totalCount,
            totalPages);
    }

    public async Task<PetDto?> GetPetByIdAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Pets
            .AsNoTracking()
            .Include(p => p.Owner)
            .Where(pet => pet.Id == id)
            .Select(pet => ToDto(pet))
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<PetDto> CreatePetAsync(
        CreatePetRequest request,
        Guid ownerId,
        CancellationToken cancellationToken)
    {
        var organizationId = EnsureTenant();

        var pet = new Pet
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            OwnerId = ownerId,
            Name = request.Name.Trim(),
            Breed = NormalizeOptional(request.Breed),
            Age = request.Age,
            Type = request.Type.Trim(),
            Location = request.Location.Trim(),
            Description = NormalizeOptional(request.Description),
            ImageUrl = NormalizeOptional(request.ImageUrl),
            ImageFileName = NormalizeOptional(request.ImageFileName),
            Status = request.Status,
            IsVaccinated = request.IsVaccinated,
            IsSterilized = request.IsSterilized,
            IsDewormed = request.IsDewormed,
            HealthNotes = NormalizeOptional(request.HealthNotes),
            GoodWithKids = request.GoodWithKids,
            GoodWithDogs = request.GoodWithDogs,
            GoodWithCats = request.GoodWithCats,
            BehaviorNotes = NormalizeOptional(request.BehaviorNotes)
        };

        _dbContext.Pets.Add(pet);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(pet);
    }

    public async Task<bool> UpdatePetAsync(
        Guid id,
        UpdatePetRequest request,
        CancellationToken cancellationToken)
    {
        EnsureTenant();

        var pet = await _dbContext.Pets
            .FirstOrDefaultAsync(pet => pet.Id == id, cancellationToken);

        if (pet is null)
        {
            return false;
        }

        pet.Name = request.Name.Trim();
        pet.Breed = NormalizeOptional(request.Breed);
        pet.Age = request.Age;
        pet.Type = request.Type.Trim();
        pet.Location = request.Location.Trim();
        pet.Description = NormalizeOptional(request.Description);
        pet.ImageUrl = NormalizeOptional(request.ImageUrl);
        pet.ImageFileName = NormalizeOptional(request.ImageFileName);
        pet.Status = request.Status;
        pet.IsVaccinated = request.IsVaccinated;
        pet.IsSterilized = request.IsSterilized;
        pet.IsDewormed = request.IsDewormed;
        pet.HealthNotes = NormalizeOptional(request.HealthNotes);
        pet.GoodWithKids = request.GoodWithKids;
        pet.GoodWithDogs = request.GoodWithDogs;
        pet.GoodWithCats = request.GoodWithCats;
        pet.BehaviorNotes = NormalizeOptional(request.BehaviorNotes);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<bool> DeletePetAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        EnsureTenant();

        var pet = await _dbContext.Pets
            .FirstOrDefaultAsync(pet => pet.Id == id, cancellationToken);

        if (pet is null)
        {
            return false;
        }

        _dbContext.Pets.Remove(pet);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    public async Task<IReadOnlyList<PetDto>> GetMyPetsAsync(
        Guid ownerId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.Pets
            .AsNoTracking()
            .Include(p => p.Owner)
            .Where(pet => pet.OwnerId == ownerId)
            .OrderByDescending(pet => pet.CreatedAt)
            .Select(pet => ToDto(pet))
            .ToListAsync(cancellationToken);
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

    private static PetDto ToDto(Pet pet)
    {
        return new PetDto(
            pet.Id,
            pet.OrganizationId,
            pet.OwnerId,
            pet.Owner != null ? pet.Owner.FullName : null,
            pet.Name,
            pet.Breed,
            pet.Age,
            pet.Type,
            pet.Location,
            pet.Description,
            pet.ImageUrl,
            pet.ImageFileName,
            pet.Status,
            pet.IsVaccinated,
            pet.IsSterilized,
            pet.IsDewormed,
            pet.HealthNotes,
            pet.GoodWithKids,
            pet.GoodWithDogs,
            pet.GoodWithCats,
            pet.BehaviorNotes,
            pet.CreatedAt,
            pet.UpdatedAt);
    }
}
