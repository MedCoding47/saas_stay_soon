using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Api.Contracts.SuperAdmin;
using PawFinds.Application.SuperAdmin;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/superadmin")]
public sealed class SuperAdminController : ControllerBase
{
    private readonly ISuperAdminService _superAdminService;

    public SuperAdminController(ISuperAdminService superAdminService)
    {
        _superAdminService = superAdminService;
    }

    [HttpPost("organizations")]
    public async Task<ActionResult<CreateOrganizationResponse>> CreateOrganization(
        CreateOrganizationRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var orgId = await _superAdminService.CreateOrganizationAsync(
                request.Name,
                request.Slug,
                cancellationToken);

            return CreatedAtAction(
                nameof(CreateOrganization),
                new { id = orgId },
                new CreateOrganizationResponse(orgId));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
