using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class VeterinaireProfile : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid OrganizationId { get; set; }

    public string ClinicName { get; set; } = string.Empty;

    public string Location { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Description { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public string? GoogleMapsUrl { get; set; }

    public string? Formation { get; set; }

    public bool IsAvailable { get; set; } = true;

    public User? User { get; set; }

    public Organization? Organization { get; set; }

    public ICollection<Advice> AdviceList { get; set; } = [];

    public ICollection<Booking> Bookings { get; set; } = [];

    public ICollection<PetCareRecommendation> Recommendations { get; set; } = [];

    public ICollection<Review> Reviews { get; set; } = [];
}
