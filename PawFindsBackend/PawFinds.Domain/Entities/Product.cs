using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Product : BaseEntity
{
    public Guid OrganizationId { get; set; }

    public Guid PetId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    public Organization? Organization { get; set; }

    public Pet? Pet { get; set; }
}
