namespace PawFinds.Api.Contracts.Messages;

public sealed record SendMessageRequest(
    Guid RecipientId,
    string Content);
