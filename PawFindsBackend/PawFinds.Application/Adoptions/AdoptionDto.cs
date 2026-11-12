using PawFinds.Domain.Enums;

namespace PawFinds.Application.Adoptions;

public sealed record AdoptionDto(
    Guid Id,
    Guid OrganizationId,
    Guid PetId,
    Guid? AdopterId,
    string? AdopterName,
    string? AdopterPhone,
    string? AdopterEmail,
    string? AdopterAddress,
    string? PetName,
    string? PetImageUrl,
    AdoptionStatus Status,
    string? ApplicationMessage,
    string? AdminNotes,
    DateTimeOffset? CompletedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt,
    string? AdopterProfilePictureUrl);
