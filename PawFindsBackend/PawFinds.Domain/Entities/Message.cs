using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Message : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid SenderId { get; set; }
    public Guid RecipientId { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; }

    public User? Sender { get; set; }
    public User? Recipient { get; set; }
}
