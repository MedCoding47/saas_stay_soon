using System.ComponentModel.DataAnnotations;

namespace PawFinds.Api.Contracts.Adoptions;

public sealed class ApplyAdoptionRequest
{
    [Required]
    public Guid PetId { get; set; }

    [MaxLength(2000)]
    public string? ApplicationMessage { get; set; }
}
