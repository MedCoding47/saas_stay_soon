using PawFinds.Domain.Enums;

namespace PawFinds.Application.Pets;

public sealed record PetDto(
    Guid Id,
    Guid OrganizationId,
    Guid? OwnerId,
    string? OwnerName,
    string Name,
    string? Breed,
    int Age,
    string Type,
    string Location,
    string? Description,
    string? ImageUrl,
    string? ImageFileName,
    AdoptionStatus Status,
    bool? IsVaccinated,
    bool? IsSterilized,
    bool? IsDewormed,
    string? HealthNotes,
    bool? GoodWithKids,
    bool? GoodWithDogs,
    bool? GoodWithCats,
    string? BehaviorNotes,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);
