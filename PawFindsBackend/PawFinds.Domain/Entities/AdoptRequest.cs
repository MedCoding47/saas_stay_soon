using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class AdoptRequest : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid OrganizationId { get; set; }

    public string PetName { get; set; } = string.Empty;

    public string Species { get; set; } = string.Empty;

    public string? Breed { get; set; }

    public int Age { get; set; }

    public string Reason { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string ContactPhone { get; set; } = string.Empty;
    
    public string ContactEmail { get; set; } = string.Empty;

    public string? ImageUrls { get; set; }
    
    public AdoptRequestStatus Status { get; set; } = AdoptRequestStatus.Pending;

    public string? AdminResponse { get; set; }

    public DateTimeOffset? RespondedAt { get; set; }

    public Guid? RespondedById { get; set; }

    public User? User { get; set; }

    public Organization? Organization { get; set; }

    public User? RespondedBy { get; set; }
}

public enum AdoptRequestStatus
{
    Pending = 1,
    Approved = 2,
    Rejected = 3
}
