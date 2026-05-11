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
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt);
