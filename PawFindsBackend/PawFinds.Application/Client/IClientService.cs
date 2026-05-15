namespace PawFinds.Application.Client;

public interface IClientService
{
    Task<IReadOnlyList<FavoriteDto>> GetFavoritesAsync(Guid userId, CancellationToken ct);
    Task<FavoriteDto> AddFavoriteAsync(Guid userId, Guid petId, CancellationToken ct);
    Task<bool> RemoveFavoriteAsync(Guid userId, Guid petId, CancellationToken ct);
    Task<int> GetAdoptionCountAsync(Guid userId, CancellationToken ct);
    Task<AdoptRequestDto> SubmitAdoptRequestAsync(Guid userId, Guid organizationId, SubmitAdoptRequest request, CancellationToken ct);
    Task<IReadOnlyList<AdoptRequestDto>> GetMyAdoptRequestsAsync(Guid userId, CancellationToken ct);
}

public sealed record FavoriteDto(Guid Id, Guid PetId, string? PetName, string? PetImageUrl, DateTimeOffset CreatedAt);

public sealed record SubmitAdoptRequest(
    string PetName, string Species, string? Breed, int Age,
    string Reason, string? Description, string ContactPhone, string ContactEmail,
    List<string>? ImageUrls = null);

public sealed record AdoptRequestDto(
    Guid Id, string PetName, string Species, string? Breed, int Age,
    string Reason, string? Description, string ContactPhone, string ContactEmail,
    List<string>? ImageUrls,
    string Status, string? AdminResponse, DateTimeOffset? RespondedAt, DateTimeOffset CreatedAt,
    string? ProfilePictureUrl);
