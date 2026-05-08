using System.Security.Claims;

namespace PawFinds.Api.MultiTenancy;

public sealed class TenantMiddleware
{
    private readonly RequestDelegate _next;

    public TenantMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var organizationIdClaim = context.User.FindFirstValue(TenantConstants.OrganizationIdClaim);

        if (Guid.TryParse(organizationIdClaim, out var organizationId))
        {
            context.Items[TenantConstants.OrganizationIdItem] = organizationId;
        }

        await _next(context);
    }
}
