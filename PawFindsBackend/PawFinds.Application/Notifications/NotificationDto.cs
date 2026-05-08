namespace PawFinds.Application.Notifications;

public sealed record NotificationDto(
    Guid Id,
    Guid UserId,
    string Content,
    bool IsRead,
    DateTimeOffset CreatedAt);
