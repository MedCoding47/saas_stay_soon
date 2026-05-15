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

    [MaxLength(260)]
    public string? ImageFileName { get; set; }

    [EnumDataType(typeof(AdoptionStatus))]
    public AdoptionStatus Status { get; set; } = AdoptionStatus.Available;

    public bool? IsVaccinated { get; set; }
    public bool? IsSterilized { get; set; }
    public bool? IsDewormed { get; set; }

    [MaxLength(2000)]
    public string? HealthNotes { get; set; }

    public bool? GoodWithKids { get; set; }
    public bool? GoodWithDogs { get; set; }
    public bool? GoodWithCats { get; set; }

    [MaxLength(2000)]
    public string? BehaviorNotes { get; set; }

    public List<Guid>? ProductIds { get; set; }
}
