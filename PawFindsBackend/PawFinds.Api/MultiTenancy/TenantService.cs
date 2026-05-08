using PawFinds.Application.MultiTenancy;

namespace PawFinds.Api.MultiTenancy;

public sealed class TenantService : ITenantService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TenantService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public Guid? OrganizationId
    {
        get
        {
            var httpContext = _httpContextAccessor.HttpContext;

            if (httpContext?.Items.TryGetValue(TenantConstants.OrganizationIdItem, out var value) == true
                && value is Guid organizationId)
            {
                return organizationId;
            }

            return null;
        }
    }

    public bool HasOrganization => OrganizationId.HasValue;
}
