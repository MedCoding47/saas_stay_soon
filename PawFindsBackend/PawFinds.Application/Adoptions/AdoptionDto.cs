using PawFinds.Domain.Enums;

namespace PawFinds.Application.Adoptions;

public sealed record AdoptionDto(
    Guid Id,
    Guid OrganizationId,
    Guid PetId,
    Guid AdopterId,
    AdoptionStatus Status,
    string? ApplicationMessage,
    string? AdminNotes,
    DateTimeOffset? CompletedAt,
    DateTimeOffset CreatedAt,
    DateTimeOffset? UpdatedAt,
    string? AdopterProfilePictureUrl);
