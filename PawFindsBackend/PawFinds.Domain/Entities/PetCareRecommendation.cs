using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class PetCareRecommendation : BaseEntity
{
    public Guid VeterinaireProfileId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string? TargetSpecies { get; set; }

    public string? TargetAgeRange { get; set; }

    public VeterinaireProfile? VeterinaireProfile { get; set; }
}
