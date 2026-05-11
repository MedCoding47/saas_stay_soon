using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Conversation : BaseEntity
{
    public Guid OrganizationId { get; set; }
    public Guid PetId { get; set; }
    public Guid PetHolderId { get; set; }
    public Guid AdopterId { get; set; }
    public bool IsOpen { get; set; } = true;

    public Organization? Organization { get; set; }
    public Pet? Pet { get; set; }
    public User? PetHolder { get; set; }
    public User? Adopter { get; set; }
    public ICollection<Message> Messages { get; set; } = [];
}
