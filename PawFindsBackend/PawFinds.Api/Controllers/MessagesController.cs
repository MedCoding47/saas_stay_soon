using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Api.Contracts.Messages;
using PawFinds.Application.Common;
using PawFinds.Application.Messages;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/messages")]
public sealed class MessagesController : ControllerBase
{
    private readonly IMessageService _messageService;

    public MessagesController(IMessageService messageService)
    {
        _messageService = messageService;
    }

    [HttpPost]
    public async Task<ActionResult<MessageDto>> SendMessage(
        SendMessageRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var senderId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        try
        {
            var message = await _messageService.SendMessageAsync(
                senderId,
                request.RecipientId,
                request.Content,
                organizationId,
                cancellationToken);

            return CreatedAtAction(nameof(GetConversation), new { userId = request.RecipientId }, message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<IReadOnlyList<ConversationDto>>> GetConversations(
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        var conversations = await _messageService.GetConversationsAsync(
            userId,
            organizationId,
            cancellationToken);

        return Ok(conversations);
    }

    [HttpGet("conversation/{userId:guid}")]
    public async Task<ActionResult<PagedResult<MessageDto>>> GetConversation(
        Guid userId,
        CancellationToken cancellationToken,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (!TryGetCurrentUserId(out var currentUserId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        var messages = await _messageService.GetConversationAsync(
            userId,
            currentUserId,
            organizationId,
            page,
            pageSize,
            cancellationToken);

        return Ok(messages);
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        var success = await _messageService.MarkAsReadAsync(
            id,
            userId,
            organizationId,
            cancellationToken);

        if (!success)
            return NotFound();

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
