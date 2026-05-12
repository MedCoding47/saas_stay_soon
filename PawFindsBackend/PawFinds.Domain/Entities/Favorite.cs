using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Favorite : BaseEntity
{
    public Guid UserId { get; set; }

    public Guid PetId { get; set; }

    public User? User { get; set; }

    public Pet? Pet { get; set; }
}
