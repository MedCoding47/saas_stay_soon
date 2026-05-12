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
}

public sealed record SuperAdminUserDto(Guid Id, string Email, string FullName, string Role, string? Phone, bool IsActive, string? OrgName);
public sealed record SuperAdminOrgDto(Guid Id, string Name, string Slug, bool IsActive, int UserCount, int PetCount);
public sealed record SuperAdminPetDto(Guid Id, string Name, string Type, string? Breed, string Status, string? OrgName);
public sealed record SuperAdminAdoptionDto(Guid Id, string PetName, string AdopterName, string Status, DateTimeOffset CreatedAt);
public sealed record SuperAdminAdoptRequestDto(Guid Id, string UserName, string PetName, string Species, string Status, DateTimeOffset CreatedAt, bool IsOverdue);
public sealed record DashboardStatsDto(int TotalUsers, int TotalOrgs, int TotalPets, int TotalAdoptions, int PendingAdoptRequests, int TotalVets);
