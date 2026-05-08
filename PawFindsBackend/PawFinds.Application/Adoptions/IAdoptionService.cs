using PawFinds.Application.Common;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.Adoptions;

public interface IAdoptionService
{
    Task<IReadOnlyList<AdoptionDto>> GetAdoptionsAsync(
        CancellationToken cancellationToken);

    Task<PagedResult<AdoptionDto>> GetAdoptionsPagedAsync(
        GetAdoptionsRequest request,
        CancellationToken cancellationToken);

    Task<AdoptionDto> CreateApplicationAsync(
        CreateAdoptionRequest request,
        CancellationToken cancellationToken);

    Task<AdoptionDto?> TransitionAsync(
        Guid adoptionId,
        TransitionAdoptionRequest request,
        CancellationToken cancellationToken);

    bool CanTransition(
        AdoptionStatus currentStatus,
        AdoptionStatus nextStatus);
}
