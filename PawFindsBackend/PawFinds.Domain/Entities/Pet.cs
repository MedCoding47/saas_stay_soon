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

    public bool? IsVaccinated { get; set; }

    public bool? IsSterilized { get; set; }

    public bool? IsDewormed { get; set; }

    public string? HealthNotes { get; set; }

    public bool? GoodWithKids { get; set; }

    public bool? GoodWithDogs { get; set; }

    public bool? GoodWithCats { get; set; }

    public string? BehaviorNotes { get; set; }

    public Organization? Organization { get; set; }

    public User? Owner { get; set; }

    public ICollection<Conversation> Conversations { get; set; } = [];

    public ICollection<Product> Products { get; set; } = [];

    public ICollection<Favorite> Favorites { get; set; } = [];

    public ICollection<Booking> Bookings { get; set; } = [];
}
