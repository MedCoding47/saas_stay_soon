using PawFinds.Domain.Enums;

namespace PawFinds.Application.Pets;

public sealed record PetDto(
    Guid Id,
    Guid OrganizationId,
    string Name,
    string? Breed,
    int Age,
    string Type,
    string Location,
    string? Description,
    string? ImageUrl,
    AdoptionStatus Status,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);
