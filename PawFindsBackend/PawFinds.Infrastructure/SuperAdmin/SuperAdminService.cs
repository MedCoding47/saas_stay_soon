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

    public async Task<SuperAdminUserDetailDto?> GetUserDetailsAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users
            .IgnoreQueryFilters()
            .Include(u => u.Organization)
            .Include(u => u.VeterinaireProfile)
            .Include(u => u.OwnedPets)
            .Include(u => u.Favorites)
            .Include(u => u.Bookings)
            .FirstOrDefaultAsync(u => u.Id == userId, ct);

        if (user is null) return null;

        var adoptionsCount = await _db.Adoptions
            .IgnoreQueryFilters()
            .CountAsync(a => a.AdopterId == userId, ct);

        CompanyDetailDto? companyProfile = null;
        if (user.Role == RoleType.Enterprise && user.OrganizationId != Guid.Empty)
        {
            var cp = await _db.CompanyProfiles
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.OrganizationId == user.OrganizationId, ct);
            if (cp is not null)
            {
                companyProfile = new CompanyDetailDto(
                    cp.Id, cp.CompanyName, cp.Description, cp.LogoUrl,
                    cp.Location, cp.Phone, cp.Email, cp.Website);
            }
        }

        return new SuperAdminUserDetailDto(
            user.Id, user.Email, user.FullName, user.Role.ToString(),
            user.PhoneNumber, user.IsActive, user.About, user.ProfilePictureUrl,
            user.OrganizationId, user.Organization?.Name, user.Organization?.Slug,
            user.CreatedAt, user.UpdatedAt,
            companyProfile,
            user.VeterinaireProfile is not null
                ? new VeterinaireDetailDto(
                    user.VeterinaireProfile.Id, user.VeterinaireProfile.ClinicName,
                    user.VeterinaireProfile.Location, user.VeterinaireProfile.Phone,
                    user.VeterinaireProfile.Description, user.VeterinaireProfile.IsAvailable)
                : null,
            user.OwnedPets.Count, adoptionsCount,
            user.Favorites.Count, user.Bookings.Count
        );
    }

    public async Task<CreateAccountResultDto> CreateEnterpriseAccountAsync(CreateEnterpriseRequest request, CancellationToken ct)
    {
        var slugExists = await _db.Organizations
            .IgnoreQueryFilters()
            .AnyAsync(o => o.Slug == request.OrgSlug, ct);
        if (slugExists)
            throw new InvalidOperationException("Organization slug already exists.");

        var emailExists = await _db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.AdminEmail, ct);
        if (emailExists)
            throw new InvalidOperationException("Email already exists.");

        var org = new Organization
        {
            Name = request.OrgName,
            Slug = request.OrgSlug,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.Organizations.Add(org);
        await _db.SaveChangesAsync(ct);

        var tempPassword = GenerateTempPassword();
        var user = new User
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            Email = request.AdminEmail,
            FullName = request.AdminFullName,
            Role = RoleType.Enterprise,
            PhoneNumber = request.AdminPhone,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var companyProfile = new CompanyProfile
        {
            OrganizationId = org.Id,
            CompanyName = request.CompanyName,
            Description = request.Description,
            Location = request.Location,
            Phone = request.CompanyPhone,
            Email = request.CompanyEmail,
            Website = request.Website,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.CompanyProfiles.Add(companyProfile);
        await _db.SaveChangesAsync(ct);

        return new CreateAccountResultDto(user.Id, tempPassword);
    }

    public async Task<CreateAccountResultDto> CreateVeterinaireAccountAsync(CreateVeterinaireRequest request, CancellationToken ct)
    {
        var slugExists = await _db.Organizations
            .IgnoreQueryFilters()
            .AnyAsync(o => o.Slug == request.OrgSlug, ct);
        if (slugExists)
            throw new InvalidOperationException("Organization slug already exists.");

        var emailExists = await _db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.AdminEmail, ct);
        if (emailExists)
            throw new InvalidOperationException("Email already exists.");

        var org = new Organization
        {
            Name = request.OrgName,
            Slug = request.OrgSlug,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.Organizations.Add(org);
        await _db.SaveChangesAsync(ct);

        var tempPassword = GenerateTempPassword();
        var user = new User
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            Email = request.AdminEmail,
            FullName = request.AdminFullName,
            Role = RoleType.Veterinaire,
            PhoneNumber = request.AdminPhone,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var vetProfile = new VeterinaireProfile
        {
            UserId = user.Id,
            OrganizationId = org.Id,
            ClinicName = request.ClinicName,
            Location = request.Location,
            Phone = request.ClinicPhone,
            Description = request.Description,
            IsAvailable = request.IsAvailable,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.VeterinaireProfiles.Add(vetProfile);
        await _db.SaveChangesAsync(ct);

        return new CreateAccountResultDto(user.Id, tempPassword);
    }

    public async Task UpdateUserAsync(Guid userId, UpdateUserRequest request, CancellationToken ct)
    {
        var user = await _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException("User not found.");

        var emailTaken = await _db.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.Email && u.Id != userId, ct);
        if (emailTaken)
            throw new InvalidOperationException("Email already in use by another user.");

        user.Email = request.Email;
        user.FullName = request.FullName;
        user.PhoneNumber = request.Phone;
        user.IsActive = request.IsActive;
        user.About = request.About;
        user.ProfilePictureUrl = request.ProfilePictureUrl;
        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task DeleteUserAsync(Guid userId, CancellationToken ct)
    {
        var user = await _db.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId, ct)
            ?? throw new InvalidOperationException("User not found.");

        user.IsActive = false;
        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateCompanyProfileAsync(Guid orgId, UpdateCompanyProfileRequest request, CancellationToken ct)
    {
        var profile = await _db.CompanyProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.OrganizationId == orgId, ct)
            ?? throw new InvalidOperationException("Company profile not found.");

        profile.CompanyName = request.CompanyName;
        profile.Location = request.Location;
        profile.Description = request.Description;
        profile.Phone = request.Phone;
        profile.Email = request.Email;
        profile.Website = request.Website;
        profile.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task UpdateVeterinaireProfileAsync(Guid userId, UpdateVeterinaireProfileRequest request, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.UserId == userId, ct)
            ?? throw new InvalidOperationException("Veterinaire profile not found.");

        profile.ClinicName = request.ClinicName;
        profile.Location = request.Location;
        profile.Description = request.Description;
        profile.Phone = request.Phone;
        profile.IsAvailable = request.IsAvailable;
        profile.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
    }

    public async Task<OrganizationDetailDto?> GetOrganizationDetailsAsync(Guid orgId, CancellationToken ct)
    {
        var org = await _db.Organizations
            .IgnoreQueryFilters()
            .Include(o => o.Users)
            .Include(o => o.Pets).ThenInclude(p => p.Products)
            .FirstOrDefaultAsync(o => o.Id == orgId, ct);

        if (org is null) return null;

        var companyProfile = await _db.CompanyProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.OrganizationId == orgId, ct);

        var vetProfile = await _db.VeterinaireProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(v => v.OrganizationId == orgId, ct);

        var adoptions = await _db.Adoptions
            .IgnoreQueryFilters()
            .Include(a => a.Pet)
            .Include(a => a.Adopter)
            .Where(a => a.OrganizationId == orgId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new OrgAdoptionDto(
                a.Id, a.Pet!.Name, a.Adopter!.FullName, a.CreatedAt, a.Status.ToString()))
            .ToListAsync(ct);

        var products = org.Pets
            .SelectMany(p => p.Products.Select(pr => new OrgProductDto(pr.Id, pr.Name, pr.Price, p.Id)))
            .ToList();

        return new OrganizationDetailDto(
            org.Id, org.Name, org.Slug, org.IsActive,
            companyProfile is not null
                ? new CompanyDetailDto(
                    companyProfile.Id, companyProfile.CompanyName,
                    companyProfile.Description, companyProfile.LogoUrl,
                    companyProfile.Location, companyProfile.Phone,
                    companyProfile.Email, companyProfile.Website)
                : null,
            vetProfile is not null
                ? new VeterinaireDetailDto(
                    vetProfile.Id, vetProfile.ClinicName,
                    vetProfile.Location, vetProfile.Phone,
                    vetProfile.Description, vetProfile.IsAvailable)
                : null,
            org.Users.Select(u => new OrgUserDto(u.Id, u.FullName, u.Email, u.Role.ToString(), u.IsActive)).ToList(),
            org.Pets.Select(p => new OrgPetDto(p.Id, p.Name, p.Type, p.Breed, p.Status.ToString())).ToList(),
            products,
            adoptions,
            org.Users.Count, org.Pets.Count, products.Count, adoptions.Count
        );
    }

    private static string GenerateTempPassword()
    {
        var guid = Guid.NewGuid().ToString("N");
        return $"Temp@{guid[..8]}!";
    }
}
