namespace PawFinds.Application.SuperAdmin;

public interface ISuperAdminService
{
    Task<Guid> CreateOrganizationAsync(
        string name,
        string slug,
        CancellationToken cancellationToken);
}
