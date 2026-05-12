using PawFinds.Application.Common;

namespace PawFinds.Application.AdoptedPets;

public interface IAdoptedPetsService
{
    Task<PagedResult<AdoptedPetDto>> GetAdoptedPetsAsync(AdoptedPetQueryParameters query, CancellationToken ct);
}

public sealed record AdoptedPetQueryParameters(int PageNumber = 1, int PageSize = 20);

public sealed record AdoptedPetDto(
    Guid Id, string Name, string? Breed, int Age, string Type, string Location,
    string? ImageUrl, string? AdopterName, string? EnterpriseName,
    DateTimeOffset AdoptedAt, DateTimeOffset? CompletedAt);
