using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Review : BaseEntity
{
    public Guid AuthorId { get; set; }
    public Guid? VeterinaireProfileId { get; set; }
    public Guid? CompanyProfileId { get; set; }
    public Guid? BookingId { get; set; }
    public int Rating { get; set; }
    public string? Comment { get; set; }

    public User? Author { get; set; }
    public VeterinaireProfile? VeterinaireProfile { get; set; }
    public CompanyProfile? CompanyProfile { get; set; }
    public Booking? Booking { get; set; }
}
