namespace PawFinds.Api.Contracts.Organizations;

public sealed record InviteUserResponse(
    Guid UserId,
    string TempPassword);
