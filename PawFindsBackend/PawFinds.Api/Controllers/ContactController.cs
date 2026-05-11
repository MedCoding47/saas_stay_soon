using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Contact;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/contact")]
public sealed class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpPost]
    public async Task<ActionResult<ContactRequestDto>> CreateContactRequest(
        CreateContactRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        var contactRequest = await _contactService.CreateContactRequestAsync(
            userId,
            request.Subject,
            request.Message,
            organizationId,
            cancellationToken);

        return Ok(contactRequest);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<ActionResult<IReadOnlyList<ContactRequestDto>>> GetContactRequests(
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentOrganizationId(out var organizationId))
            return Unauthorized();

        var requests = await _contactService.GetContactRequestsAsync(
            organizationId,
            cancellationToken);

        return Ok(requests);
    }

    [HttpPatch("{id:guid}/read")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    public async Task<IActionResult> MarkAsRead(
        Guid id,
        CancellationToken cancellationToken)
    {
        var success = await _contactService.MarkAsReadAsync(id, cancellationToken);

        return success ? NoContent() : NotFound();
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirstValue("user_id");
        return Guid.TryParse(userIdClaim, out userId);
    }

    private bool TryGetCurrentOrganizationId(out Guid organizationId)
    {
        var orgIdClaim = User.FindFirstValue("organization_id");
        return Guid.TryParse(orgIdClaim, out organizationId);
    }
}
