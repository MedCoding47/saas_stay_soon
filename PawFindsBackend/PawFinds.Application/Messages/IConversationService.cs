using PawFinds.Application.Common;

namespace PawFinds.Application.Messages;

public interface IConversationService
{
    Task<ConversationDto> StartConversationAsync(
        Guid petId,
        Guid adopterId,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ConversationDto>> GetConversationsForUserAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<PagedResult<MessageDto>> GetConversationMessagesAsync(
        Guid conversationId,
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<bool> CloseConversationAsync(
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken);
}
