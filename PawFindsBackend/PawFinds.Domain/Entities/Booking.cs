using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Booking : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid VeterinaireProfileId { get; set; }

    public Guid? PetId { get; set; }

    public DateTimeOffset BookingDate { get; set; }

    public BookingStatus Status { get; set; } = BookingStatus.Pending;

    public string? Notes { get; set; }

    public User? User { get; set; }

    public VeterinaireProfile? VeterinaireProfile { get; set; }

    public Pet? Pet { get; set; }
}

public enum BookingStatus
{
    Pending = 1,
    Confirmed = 2,
    Cancelled = 3,
    Completed = 4
}
