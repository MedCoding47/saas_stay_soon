using PawFinds.Application.Common;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.SuperAdmin;

public interface ISuperAdminService
{
    Task<Guid> CreateOrganizationAsync(string name, string slug, CancellationToken ct);
    Task<Guid> CreateUserAsync(string email, string fullName, RoleType role, Guid organizationId, string? phone, CancellationToken ct);
    Task<IReadOnlyList<SuperAdminUserDto>> GetAllUsersAsync(CancellationToken ct);
    Task<IReadOnlyList<SuperAdminOrgDto>> GetAllOrganizationsAsync(CancellationToken ct);
    Task<IReadOnlyList<SuperAdminPetDto>> GetAllPetsAsync(CancellationToken ct);
    Task<IReadOnlyList<SuperAdminAdoptionDto>> GetAllAdoptionsAsync(CancellationToken ct);
    Task<IReadOnlyList<SuperAdminAdoptRequestDto>> GetAdoptRequestsAsync(CancellationToken ct);
    Task<bool> RespondToAdoptRequestAsync(Guid requestId, Guid adminId, bool approved, string? response, CancellationToken ct);
    Task<DashboardStatsDto> GetDashboardStatsAsync(CancellationToken ct);
    Task<SuperAdminUserDetailDto?> GetUserDetailsAsync(Guid userId, CancellationToken ct);
    Task<CreateAccountResultDto> CreateEnterpriseAccountAsync(CreateEnterpriseRequest request, CancellationToken ct);
    Task<CreateAccountResultDto> CreateVeterinaireAccountAsync(CreateVeterinaireRequest request, CancellationToken ct);
    Task UpdateUserAsync(Guid userId, UpdateUserRequest request, CancellationToken ct);
    Task DeleteUserAsync(Guid userId, CancellationToken ct);
    Task UpdateCompanyProfileAsync(Guid orgId, UpdateCompanyProfileRequest request, CancellationToken ct);
    Task UpdateVeterinaireProfileAsync(Guid userId, UpdateVeterinaireProfileRequest request, CancellationToken ct);
    Task<OrganizationDetailDto?> GetOrganizationDetailsAsync(Guid orgId, CancellationToken ct);
    Task DeleteOrganizationAsync(Guid orgId, CancellationToken ct);
    Task DeleteVeterinaireAsync(Guid userId, CancellationToken ct);
}

public sealed record SuperAdminUserDto(Guid Id, string Email, string FullName, string Role, string? Phone, bool IsActive, string? OrgName);
public sealed record SuperAdminOrgDto(Guid Id, string Name, string Slug, bool IsActive, int UserCount, int PetCount);
public sealed record SuperAdminPetDto(Guid Id, string Name, string Type, string? Breed, string Status, string? OrgName);
public sealed record SuperAdminAdoptionDto(Guid Id, string PetName, string AdopterName, string Status, DateTimeOffset CreatedAt);
public sealed record SuperAdminAdoptRequestDto(Guid Id, string UserName, string PetName, string Species, string Status, DateTimeOffset CreatedAt, bool IsOverdue);
public sealed record DashboardStatsDto(int TotalUsers, int TotalOrgs, int TotalPets, int TotalAdoptions, int PendingAdoptRequests, int TotalVets);

public sealed record SuperAdminUserDetailDto(
    Guid Id, string Email, string FullName, string Role, string? Phone,
    bool IsActive, string? About, string? ProfilePictureUrl,
    Guid? OrganizationId, string? OrgName, string? OrgSlug,
    DateTimeOffset CreatedAt, DateTimeOffset? UpdatedAt,
    CompanyDetailDto? CompanyProfile,
    VeterinaireDetailDto? VeterinaireProfile,
    int PetsCount, int AdoptionsCount, int FavoritesCount, int BookingsCount
);

public sealed record CompanyDetailDto(
    Guid Id, string CompanyName, string? Description,
    string? LogoUrl, string Location, string? Phone,
    string? Email, string? Website, string? GoogleMapsUrl
);

public sealed record VeterinaireDetailDto(
    Guid Id, string ClinicName, string Location, string? Phone,
    string? Description, bool IsAvailable,
    string? GoogleMapsUrl, string? Formation
);

public sealed record CreateEnterpriseRequest(
    string OrgName, string OrgSlug,
    string CompanyName, string Location, string? Description,
    string? CompanyPhone, string? CompanyEmail, string? Website, string? GoogleMapsUrl,
    string AdminEmail, string AdminFullName, string? AdminPhone
);

public sealed record CreateVeterinaireRequest(
    string OrgName, string OrgSlug,
    string ClinicName, string Location, string? Description,
    string? ClinicPhone, bool IsAvailable,
    string? GoogleMapsUrl, string? Formation,
    string AdminEmail, string AdminFullName, string? AdminPhone
);

public sealed record CreateAccountResultDto(Guid UserId, string TempPassword);

public sealed record UpdateUserRequest(string Email, string FullName, string? Phone, bool IsActive, string? About, string? ProfilePictureUrl);
public sealed record UpdateCompanyProfileRequest(string CompanyName, string Location, string? Description, string? Phone, string? Email, string? Website, string? GoogleMapsUrl);
public sealed record UpdateVeterinaireProfileRequest(string ClinicName, string Location, string? Description, string? Phone, bool IsAvailable, string? GoogleMapsUrl, string? Formation);

public sealed record OrganizationDetailDto(
    Guid Id, string Name, string Slug, bool IsActive,
    CompanyDetailDto? CompanyProfile,
    VeterinaireDetailDto? VeterinaireProfile,
    IReadOnlyList<OrgUserDto> Users,
    IReadOnlyList<OrgPetDto> Pets,
    IReadOnlyList<OrgProductDto> Products,
    IReadOnlyList<OrgAdoptionDto> Adoptions,
    int UserCount, int PetCount, int ProductCount, int AdoptionCount
);

public sealed record OrgUserDto(Guid Id, string FullName, string Email, string Role, bool IsActive);
public sealed record OrgPetDto(Guid Id, string Name, string Type, string? Breed, string Status);
public sealed record OrgProductDto(Guid Id, string Name, decimal Price, Guid PetId);
public sealed record OrgAdoptionDto(Guid Id, string PetName, string AdopterName, DateTimeOffset CreatedAt, string Status);
