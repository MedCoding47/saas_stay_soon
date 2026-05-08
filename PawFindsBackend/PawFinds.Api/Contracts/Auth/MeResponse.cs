namespace PawFinds.Api.Contracts.Auth;

public sealed record MeResponse(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    Guid OrganizationId);
