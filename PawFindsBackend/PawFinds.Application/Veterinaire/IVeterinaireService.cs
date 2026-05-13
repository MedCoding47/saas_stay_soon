namespace PawFinds.Application.Veterinaire;

public interface IVeterinaireService
{
    Task<VeterinaireProfileDto> GetProfileAsync(Guid userId, CancellationToken ct);
    Task<VeterinaireProfileDto> UpdateProfileAsync(Guid userId, UpdateVeterinaireProfileRequest request, CancellationToken ct);
    Task<IReadOnlyList<AdviceDto>> GetAdviceAsync(Guid userId, CancellationToken ct);
    Task<AdviceDto> CreateAdviceAsync(Guid userId, CreateAdviceRequest request, CancellationToken ct);
    Task<bool> DeleteAdviceAsync(Guid adviceId, Guid userId, CancellationToken ct);
    Task<IReadOnlyList<BookingDto>> GetBookingsAsync(Guid userId, CancellationToken ct);
    Task<bool> UpdateBookingStatusAsync(Guid bookingId, Guid userId, string status, CancellationToken ct);
}

public sealed record VeterinaireProfileDto(
    Guid Id, string ClinicName, string Location, string? Phone,
    string? Description, double? Latitude, double? Longitude, bool IsAvailable,
    string? GoogleMapsUrl, string? Formation);

public sealed record UpdateVeterinaireProfileRequest(
    string ClinicName, string Location, string? Phone,
    string? Description, double? Latitude, double? Longitude, bool IsAvailable,
    string? GoogleMapsUrl, string? Formation);

public sealed record CreateAdviceRequest(string Title, string Content);

public sealed record AdviceDto(Guid Id, string Title, string Content, DateTimeOffset CreatedAt);

public sealed record BookingDto(
    Guid Id, Guid UserId, string? UserName, Guid? PetId, string? PetName,
    DateTimeOffset BookingDate, string Status, string? Notes);
