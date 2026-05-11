namespace PawFinds.Application.Messages;

public sealed record ConversationDto(
    Guid? Id,
    Guid OtherUserId,
    string OtherUserName,
    string? OtherUserPhotoUrl,
    Guid? PetId,
    string? PetName,
    string? PetImageUrl,
    bool IsOpen,
    string LastMessageContent,
    DateTimeOffset LastMessageAt,
    int UnreadCount);
