using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Organization : BaseEntity
{
    public string Name { get; set; } = string.Empty;

    public string Slug { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = [];

    public ICollection<Pet> Pets { get; set; } = [];

    public ICollection<Adoption> Adoptions { get; set; } = [];
}
