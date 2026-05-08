using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Api.Contracts.Organizations;
using PawFinds.Application.Organizations;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/organizations")]
public sealed class OrganizationsController : ControllerBase
{
    private readonly IOrganizationService _organizationService;

    public OrganizationsController(IOrganizationService organizationService)
    {
        _organizationService = organizationService;
    }

    [HttpPost("invite")]
    public async Task<ActionResult<InviteUserResponse>> InviteUser(
        InviteUserRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        try
        {
            var (userId, tempPassword) = await _organizationService.InviteUserAsync(
                request.Email,
                request.FullName,
                request.Role,
                organizationId,
                cancellationToken);

            return CreatedAtAction(
                nameof(InviteUser),
                new { id = userId },
                new InviteUserResponse(userId, tempPassword));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private bool TryGetCurrentOrganizationId(out Guid organizationId)
    {
        var orgIdClaim = User.FindFirstValue("organization_id");
        return Guid.TryParse(orgIdClaim, out organizationId);
    }
}
