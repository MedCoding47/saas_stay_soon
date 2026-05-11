using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Api.Contracts.Messages;
using PawFinds.Application.Common;
using PawFinds.Application.Messages;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/conversations")]
public sealed class ConversationsController : ControllerBase
{
    private readonly IConversationService _conversationService;
    private readonly IMessageService _messageService;

    public ConversationsController(
        IConversationService conversationService,
        IMessageService messageService)
    {
        _conversationService = conversationService;
        _messageService = messageService;
    }

    [HttpPost("start/{petId:guid}")]
    public async Task<ActionResult<ConversationDto>> StartConversation(
        Guid petId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        try
        {
            var conversation = await _conversationService.StartConversationAsync(
                petId,
                userId,
                organizationId,
                cancellationToken);

            return Ok(conversation);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ConversationDto>>> GetConversations(
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        var conversations = await _conversationService.GetConversationsForUserAsync(
            userId,
            organizationId,
            cancellationToken);

        return Ok(conversations);
    }

    [HttpGet("{conversationId:guid}/messages")]
    public async Task<ActionResult<PagedResult<MessageDto>>> GetMessages(
        Guid conversationId,
        CancellationToken cancellationToken,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (!TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var messages = await _conversationService.GetConversationMessagesAsync(
            conversationId,
            userId,
            page,
            pageSize,
            cancellationToken);

        return Ok(messages);
    }

    [HttpPost("{conversationId:guid}/messages")]
    public async Task<ActionResult<MessageDto>> SendMessage(
        Guid conversationId,
        SendConversationMessageRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var senderId) ||
            !TryGetCurrentOrganizationId(out var organizationId))
        {
            return Unauthorized();
        }

        try
        {
            var message = await _messageService.SendConversationMessageAsync(
                senderId,
                conversationId,
                request.Content,
                organizationId,
                cancellationToken);

            return Ok(message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch("{conversationId:guid}/close")]
    public async Task<IActionResult> CloseConversation(
        Guid conversationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var userId))
            return Unauthorized();

        var success = await _conversationService.CloseConversationAsync(
            conversationId,
            userId,
            cancellationToken);

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
