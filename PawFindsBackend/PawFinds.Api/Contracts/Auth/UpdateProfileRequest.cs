namespace PawFinds.Api.Contracts.Auth;

public sealed class UpdateProfileRequest
{
    public string? FullName { get; set; }
    public string? PhoneNumber { get; set; }
    public string? About { get; set; }
    public string? ProfilePictureUrl { get; set; }
}
