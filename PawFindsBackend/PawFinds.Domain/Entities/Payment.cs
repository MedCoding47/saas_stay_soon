using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Payment : BaseEntity
{
    public Guid BookingId { get; set; }
    public Guid UserId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = "mad";
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";

    public Booking? Booking { get; set; }
    public User? User { get; set; }
}
