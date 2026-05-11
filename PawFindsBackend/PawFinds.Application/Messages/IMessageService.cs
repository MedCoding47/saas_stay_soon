using PawFinds.Application.Common;

namespace PawFinds.Application.Messages;

public interface IMessageService
{
    Task<MessageDto> SendMessageAsync(
        Guid senderId,
        Guid recipientId,
        string content,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<MessageDto> SendConversationMessageAsync(
        Guid senderId,
        Guid conversationId,
        string content,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<PagedResult<MessageDto>> GetConversationAsync(
        Guid otherUserId,
        Guid currentUserId,
        Guid organizationId,
        int page,
        int pageSize,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ConversationDto>> GetConversationsAsync(
        Guid currentUserId,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<bool> MarkAsReadAsync(
        Guid messageId,
        Guid currentUserId,
        Guid organizationId,
        CancellationToken cancellationToken);
}
