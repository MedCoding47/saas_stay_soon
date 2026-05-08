namespace PawFinds.Api.Contracts.Auth;

public class LoginResponse
{
    public string Token { get; set; }
    public string TokenType { get; set; }
    public Guid UserId { get; set; }
    public Guid OrganizationId { get; set; }
    public string Role { get; set; }
}
