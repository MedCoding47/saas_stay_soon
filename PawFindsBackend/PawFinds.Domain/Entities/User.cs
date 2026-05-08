using PawFinds.Domain.Common;
using PawFinds.Domain.Enums;

namespace PawFinds.Domain.Entities;

public sealed class User : BaseEntity
{
    public Guid OrganizationId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public RoleType Role { get; set; } = RoleType.Adopter;

    public bool IsActive { get; set; } = true;

    public Organization? Organization { get; set; }
}
