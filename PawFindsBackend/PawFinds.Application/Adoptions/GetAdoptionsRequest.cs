using PawFinds.Domain.Enums;

namespace PawFinds.Application.Adoptions;

public sealed record GetAdoptionsRequest(
    AdoptionStatus? Status = null,
    Guid? PetId = null,
    Guid? AdopterId = null,
    int Page = 1,
    int PageSize = 20);
