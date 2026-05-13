using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Api.Contracts.SuperAdmin;
using PawFinds.Application.SuperAdmin;
using PawFinds.Domain.Enums;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/superadmin")]
public sealed class SuperAdminController : ControllerBase
{
    private readonly ISuperAdminService _service;

    public SuperAdminController(ISuperAdminService service)
    {
        _service = service;
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboard(CancellationToken ct)
    {
        return Ok(await _service.GetDashboardStatsAsync(ct));
    }

    [HttpPost("organizations")]
    public async Task<ActionResult<CreateOrganizationResponse>> CreateOrganization(
        CreateOrganizationRequest request,
        CancellationToken ct)
    {
        try
        {
            var orgId = await _service.CreateOrganizationAsync(request.Name, request.Slug, ct);
            return CreatedAtAction(null, new { id = orgId }, new CreateOrganizationResponse(orgId));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("users")]
    public async Task<ActionResult<CreateUserResponse>> CreateUser(CreateUserRequest request, CancellationToken ct)
    {
        try
        {
            var userId = await _service.CreateUserAsync(
                request.Email, request.FullName, request.Role,
                request.OrganizationId, request.Phone, ct);
            return Ok(new CreateUserResponse(userId, $"Temp@{request.Email.Split('@')[0]}!"));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("users")]
    public async Task<ActionResult<IReadOnlyList<SuperAdminUserDto>>> GetUsers(CancellationToken ct)
    {
        return Ok(await _service.GetAllUsersAsync(ct));
    }

    [HttpGet("organizations")]
    public async Task<ActionResult<IReadOnlyList<SuperAdminOrgDto>>> GetOrganizations(CancellationToken ct)
    {
        return Ok(await _service.GetAllOrganizationsAsync(ct));
    }

    [HttpGet("pets")]
    public async Task<ActionResult<IReadOnlyList<SuperAdminPetDto>>> GetPets(CancellationToken ct)
    {
        return Ok(await _service.GetAllPetsAsync(ct));
    }

    [HttpGet("adoptions")]
    public async Task<ActionResult<IReadOnlyList<SuperAdminAdoptionDto>>> GetAdoptions(CancellationToken ct)
    {
        return Ok(await _service.GetAllAdoptionsAsync(ct));
    }

    [HttpGet("adopt-requests")]
    public async Task<ActionResult<IReadOnlyList<SuperAdminAdoptRequestDto>>> GetAdoptRequests(CancellationToken ct)
    {
        return Ok(await _service.GetAdoptRequestsAsync(ct));
    }

    [HttpPost("adopt-requests/{id:guid}/respond")]
    public async Task<IActionResult> RespondToAdoptRequest(Guid id, RespondToAdoptRequestBody body, CancellationToken ct)
    {
        var adminId = GetUserId();
        var updated = await _service.RespondToAdoptRequestAsync(id, adminId, body.Approved, body.Response, ct);
        return updated ? NoContent() : NotFound();
    }

    [HttpGet("users/{id:guid}")]
    public async Task<ActionResult<SuperAdminUserDetailDto>> GetUserDetails(Guid id, CancellationToken ct)
    {
        var user = await _service.GetUserDetailsAsync(id, ct);
        if (user is null) return NotFound();
        return Ok(user);
    }

    [HttpPost("create-enterprise")]
    public async Task<ActionResult<CreateAccountResultDto>> CreateEnterprise(
        [FromBody] CreateEnterpriseRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _service.CreateEnterpriseAccountAsync(request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("create-veterinaire")]
    public async Task<ActionResult<CreateAccountResultDto>> CreateVeterinaire(
        [FromBody] CreateVeterinaireRequest request, CancellationToken ct)
    {
        try
        {
            var result = await _service.CreateVeterinaireAccountAsync(request, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("users/{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, [FromBody] UpdateUserRequest request, CancellationToken ct)
    {
        try
        {
            await _service.UpdateUserAsync(id, request, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("users/{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteUserAsync(id, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("companies/{orgId:guid}")]
    public async Task<IActionResult> UpdateCompanyProfile(Guid orgId, [FromBody] UpdateCompanyProfileRequest request, CancellationToken ct)
    {
        try
        {
            await _service.UpdateCompanyProfileAsync(orgId, request, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("veterinaires/{userId:guid}")]
    public async Task<IActionResult> UpdateVeterinaireProfile(Guid userId, [FromBody] UpdateVeterinaireProfileRequest request, CancellationToken ct)
    {
        try
        {
            await _service.UpdateVeterinaireProfileAsync(userId, request, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("organizations/{id:guid}")]
    public async Task<ActionResult<OrganizationDetailDto>> GetOrganizationDetails(Guid id, CancellationToken ct)
    {
        var org = await _service.GetOrganizationDetailsAsync(id, ct);
        if (org is null) return NotFound();
        return Ok(org);
    }

    [HttpDelete("organizations/{id:guid}")]
    public async Task<IActionResult> DeleteOrganization(Guid id, CancellationToken ct)
    {
        try
        {
            await _service.DeleteOrganizationAsync(id, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("veterinaires/{userId:guid}")]
    public async Task<IActionResult> DeleteVeterinaire(Guid userId, CancellationToken ct)
    {
        try
        {
            await _service.DeleteVeterinaireAsync(userId, ct);
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }
}

public sealed record CreateUserRequest(
    string Email, string FullName, RoleType Role, Guid OrganizationId, string? Phone);

public sealed record CreateUserResponse(Guid UserId, string TempPassword);

public sealed record RespondToAdoptRequestBody(bool Approved, string? Response);
