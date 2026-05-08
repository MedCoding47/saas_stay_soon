namespace PawFinds.Application.Messages;

public sealed record ConversationDto(
    Guid OtherUserId,
    string OtherUserName,
    string LastMessageContent,
    DateTimeOffset LastMessageAt,
    int UnreadCount);
