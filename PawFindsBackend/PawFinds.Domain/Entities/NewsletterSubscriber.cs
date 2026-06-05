using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class NewsletterSubscriber : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
    public bool IsActive { get; set; } = true;
}
