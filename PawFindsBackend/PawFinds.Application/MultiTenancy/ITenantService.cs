namespace PawFinds.Application.MultiTenancy;

public interface ITenantService
{
    Guid? OrganizationId { get; }

    bool HasOrganization { get; }
}
