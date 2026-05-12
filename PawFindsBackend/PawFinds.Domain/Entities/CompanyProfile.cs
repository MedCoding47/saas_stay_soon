using PawFinds.Domain.Common;

namespace PawFinds.Domain.Entities;

public sealed class CompanyProfile : BaseEntity
{
    public Guid OrganizationId { get; set; }

    public string CompanyName { get; set; } = string.Empty;

    public string? Description { get; set; }

    public string? LogoUrl { get; set; }

    public string Location { get; set; } = string.Empty;

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public string? Website { get; set; }

    public double? Latitude { get; set; }

    public double? Longitude { get; set; }

    public Organization? Organization { get; set; }
}
