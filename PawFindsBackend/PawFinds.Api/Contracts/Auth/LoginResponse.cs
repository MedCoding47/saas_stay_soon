namespace PawFinds.Api.Contracts.Auth;

public class LoginResponse
{
    public string Token { get; set; } = string.Empty;
    public string TokenType { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public Guid? OrganizationId { get; set; }
    public string Role { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}

