using System.ComponentModel.DataAnnotations;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.Pets;

public sealed class CreatePetRequest
{
    [Required]
    [MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(120)]
    public string? Breed { get; set; }

    [Range(0, 100)]
    public int Age { get; set; }

    [Required]
    [MaxLength(80)]
    public string Type { get; set; } = string.Empty;

    [Required]
    [MaxLength(160)]
    public string Location { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [MaxLength(500)]
    public string? ImageUrl { get; set; }

    [EnumDataType(typeof(AdoptionStatus))]
    public AdoptionStatus Status { get; set; } = AdoptionStatus.Available;
}
