using PawFinds.Domain.Common;
using PawFinds.Domain.Enums;

namespace PawFinds.Domain.Entities;

public sealed class Adoption : BaseEntity
{
    public Guid OrganizationId { get; set; }

    public Guid PetId { get; set; }

    public Guid? AdopterId { get; set; }

    public string? AdopterName { get; set; }

    public string? AdopterPhone { get; set; }

    public string? AdopterEmail { get; set; }

    public string? AdopterAddress { get; set; }

    public AdoptionStatus Status { get; set; } = AdoptionStatus.ApplicationReceived;

    public string? ApplicationMessage { get; set; }

    public string? AdminNotes { get; set; }

    public DateTimeOffset? CompletedAt { get; set; }

    public Organization? Organization { get; set; }

    public Pet? Pet { get; set; }

    public User? Adopter { get; set; }
}
