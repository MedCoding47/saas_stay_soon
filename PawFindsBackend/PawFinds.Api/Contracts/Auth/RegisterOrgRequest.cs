namespace PawFinds.Api.Contracts.Auth;

public record RegisterOrgRequest(
    string Email,
    string Password,
    string FullName,
    string OrgName,
    string OrgSlug,
    string? PhoneNumber = null,
    string? Location = null);