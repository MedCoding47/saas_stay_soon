using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class Advice : BaseEntity
{
    public Guid VeterinaireProfileId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public VeterinaireProfile? VeterinaireProfile { get; set; }
}
