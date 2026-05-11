namespace PawFinds.Api.Contracts.Auth;

public record RegisterRequest(
    string Email,
    string Password,
    string FullName,
    Guid OrganizationId,
    string? PhoneNumber = null,
    string? Role = null);
