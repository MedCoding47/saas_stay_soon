namespace PawFinds.Application.Contact;

public sealed record ContactRequestDto(
    Guid Id,
    Guid UserId,
    string UserName,
    string UserEmail,
    string Subject,
    string Message,
    bool IsRead,
    DateTimeOffset CreatedAt);
