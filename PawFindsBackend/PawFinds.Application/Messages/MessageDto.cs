namespace PawFinds.Application.Messages;

public sealed record MessageDto(
    Guid Id,
    Guid SenderId,
    string SenderName,
    Guid RecipientId,
    string RecipientName,
    string Content,
    bool IsRead,
    Guid? ConversationId,
    DateTimeOffset CreatedAt);
