using PawFinds.Domain.Common;
using PawFinds.Domain.Enums;

namespace PawFinds.Domain.Entities;

public sealed class Pet : BaseEntity
{
    public Guid OrganizationId { get; set; }

    public Guid? OwnerId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Breed { get; set; }

    public int Age { get; set; }

    public string Type { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? ImageUrl { get; set; }

    public string? ImageFileName { get; set; }

    public AdoptionStatus Status { get; set; } = AdoptionStatus.Available;

    public Organization? Organization { get; set; }

    public User? Owner { get; set; }

    public ICollection<Conversation> Conversations { get; set; } = [];
}
