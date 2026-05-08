using PawFinds.Application.Common;

namespace PawFinds.Application.Pets;

public interface IPetService
{
    Task<PagedResult<PetDto>> GetPetsAsync(
        PetQueryParameters query,
        CancellationToken cancellationToken);

    Task<PetDto?> GetPetByIdAsync(
        Guid id,
        CancellationToken cancellationToken);

    Task<PetDto> CreatePetAsync(
        CreatePetRequest request,
        CancellationToken cancellationToken);

    Task<bool> UpdatePetAsync(
        Guid id,
        UpdatePetRequest request,
        CancellationToken cancellationToken);

    Task<bool> DeletePetAsync(
        Guid id,
        CancellationToken cancellationToken);
}
