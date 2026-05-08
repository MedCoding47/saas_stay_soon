using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Notifications;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/notifications")]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<NotificationDto>>> GetNotifications(
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
        {
            return Unauthorized(new { message = "User context is missing." });
        }

        var notifications = await _notificationService.GetForUserAsync(
            userId,
            cancellationToken);

        return Ok(notifications);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkAsRead(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        var success = await _notificationService.MarkAsReadAsync(
            id,
            userId,
            organizationId,
            cancellationToken);

        if (!success)
            return NotFound();

        return NoContent();
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead(
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        await _notificationService.MarkAllAsReadAsync(
            userId,
            organizationId,
            cancellationToken);

        return NoContent();
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
