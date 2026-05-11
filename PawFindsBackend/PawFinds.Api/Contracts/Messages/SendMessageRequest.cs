namespace PawFinds.Api.Contracts.Messages;

public sealed record SendMessageRequest(
    Guid RecipientId,
    string Content);

public sealed record SendConversationMessageRequest(
    string Content);

