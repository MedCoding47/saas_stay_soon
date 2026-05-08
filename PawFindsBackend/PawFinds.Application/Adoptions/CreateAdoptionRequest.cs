using System.ComponentModel.DataAnnotations;

namespace PawFinds.Application.Adoptions;

public sealed class CreateAdoptionRequest
{
    [Required]
    public Guid PetId { get; set; }

    [Required]
    public Guid AdopterId { get; set; }

    [MaxLength(2000)]
    public string? ApplicationMessage { get; set; }
}
