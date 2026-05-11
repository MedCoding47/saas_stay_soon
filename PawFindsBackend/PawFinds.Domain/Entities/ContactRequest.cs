using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class ContactRequest : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid UserId { get; set; }
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsRead { get; set; }

    public Organization? Organization { get; set; }
    public User? User { get; set; }
}
