using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PawFinds.Application.SuperAdmin;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.SuperAdmin;

public sealed class SuperAdminService : ISuperAdminService
{
    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _passwordHasher;

    public SuperAdminService(AppDbContext db, IPasswordHasher<User> passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public async Task<Guid> CreateOrganizationAsync(string name, string slug, CancellationToken ct)
    {
        var slugExists = await _db.Organizations
            .IgnoreQueryFilters()
            .AnyAsync(o => o.Slug == slug, ct);
        if (slugExists)
            throw new InvalidOperationException("Slug already exists.");

        var org = new Organization
        {
            Name = name,
            Slug = slug,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.Organizations.Add(org);
        await _db.SaveChangesAsync(ct);
        return org.Id;
    }

    public async Task<Guid> CreateUserAsync(string email, string fullName, RoleType role, Guid organizationId, string? phone, CancellationToken ct)
    {
        var emailExists = await _db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == email, ct);
        if (emailExists)
            throw new InvalidOperationException("Email already exists.");

        var tempPassword = GenerateTempPassword();
        var user = new User
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Email = email,
            FullName = fullName,
            Role = role,
            PhoneNumber = phone,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        if (role == RoleType.Veterinaire)
        {
            var vetProfile = new VeterinaireProfile
            {
                UserId = user.Id,
                OrganizationId = organizationId,
                ClinicName = $"{fullName}'s Clinic",
                Location = "",
                IsAvailable = true
            };
            _db.VeterinaireProfiles.Add(vetProfile);
            await _db.SaveChangesAsync(ct);
        }

        if (role == RoleType.Enterprise)
        {
            var companyProfile = new CompanyProfile
            {
                OrganizationId = organizationId,
                CompanyName = fullName,
                Location = ""
            };
            _db.CompanyProfiles.Add(companyProfile);
            await _db.SaveChangesAsync(ct);
        }

        return user.Id;
    }

    public async Task<IReadOnlyList<SuperAdminUserDto>> GetAllUsersAsync(CancellationToken ct)
    {
        return await _db.Users
            .IgnoreQueryFilters()
            .Include(u => u.Organization)
            .OrderBy(u => u.FullName)
            .Select(u => new SuperAdminUserDto(
                u.Id, u.Email, u.FullName, u.Role.ToString(),
                u.PhoneNumber, u.IsActive, u.Organization!.Name))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SuperAdminOrgDto>> GetAllOrganizationsAsync(CancellationToken ct)
    {
        return await _db.Organizations
            .IgnoreQueryFilters()
            .Include(o => o.Users)
            .Include(o => o.Pets)
            .OrderBy(o => o.Name)
            .Select(o => new SuperAdminOrgDto(
                o.Id, o.Name, o.Slug, o.IsActive,
                o.Users.Count, o.Pets.Count))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SuperAdminPetDto>> GetAllPetsAsync(CancellationToken ct)
    {
        return await _db.Pets
            .IgnoreQueryFilters()
            .Include(p => p.Organization)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new SuperAdminPetDto(
                p.Id, p.Name, p.Type, p.Breed, p.Status.ToString(), p.Organization!.Name))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SuperAdminAdoptionDto>> GetAllAdoptionsAsync(CancellationToken ct)
    {
        return await _db.Adoptions
            .IgnoreQueryFilters()
            .Include(a => a.Pet)
            .Include(a => a.Adopter)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new SuperAdminAdoptionDto(
                a.Id, a.Pet!.Name, a.Adopter!.FullName, a.Status.ToString(), a.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<IReadOnlyList<SuperAdminAdoptRequestDto>> GetAdoptRequestsAsync(CancellationToken ct)
    {
        var now = DateTimeOffset.UtcNow;
        return await _db.AdoptRequests
            .IgnoreQueryFilters()
            .Include(ar => ar.User)
            .OrderByDescending(ar => ar.CreatedAt)
            .Select(ar => new SuperAdminAdoptRequestDto(
                ar.Id, ar.User!.FullName, ar.PetName, ar.Species,
                ar.Status.ToString(), ar.CreatedAt,
                ar.Status == AdoptRequestStatus.Pending && now > ar.CreatedAt.AddHours(24)))
            .ToListAsync(ct);
    }

    public async Task<bool> RespondToAdoptRequestAsync(Guid requestId, Guid adminId, bool approved, string? response, CancellationToken ct)
    {
        var request = await _db.AdoptRequests
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(ar => ar.Id == requestId, ct);
        if (request is null) return false;

        request.Status = approved ? AdoptRequestStatus.Approved : AdoptRequestStatus.Rejected;
        request.AdminResponse = response;
        request.RespondedAt = DateTimeOffset.UtcNow;
        request.RespondedById = adminId;

        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct)
    {
        var totalUsers = await _db.Users.IgnoreQueryFilters().CountAsync(ct);
        var totalOrgs = await _db.Organizations.IgnoreQueryFilters().CountAsync(ct);
        var totalPets = await _db.Pets.IgnoreQueryFilters().CountAsync(ct);
        var totalAdoptions = await _db.Adoptions.IgnoreQueryFilters().CountAsync(ct);
        var pendingAdoptRequests = await _db.AdoptRequests
            .IgnoreQueryFilters()
            .CountAsync(ar => ar.Status == AdoptRequestStatus.Pending, ct);
        var totalVets = await _db.VeterinaireProfiles.IgnoreQueryFilters().CountAsync(ct);

        return new DashboardStatsDto(totalUsers, totalOrgs, totalPets, totalAdoptions, pendingAdoptRequests, totalVets);
    }

    private static string GenerateTempPassword()
    {
        var guid = Guid.NewGuid().ToString("N");
        return $"Temp@{guid[..8]}!";
    }
}
