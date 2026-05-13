using PawFinds.Domain.Common;
using PawFinds.Domain.Enums;

namespace PawFinds.Domain.Entities;

public sealed class User : BaseEntity
{
    public Guid? OrganizationId { get; set; }

    public string FullName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    public RoleType Role { get; set; } = RoleType.Client;

    public bool IsActive { get; set; } = true;

    public string? PhoneNumber { get; set; }

    public string? About { get; set; }

    public string? ProfilePictureUrl { get; set; }

    public Organization? Organization { get; set; }

    public ICollection<Conversation> ConversationsAsPetHolder { get; set; } = [];

    public ICollection<Conversation> ConversationsAsAdopter { get; set; } = [];

    public ICollection<Pet> OwnedPets { get; set; } = [];

    public CompanyProfile? CompanyProfile { get; set; }

    public VeterinaireProfile? VeterinaireProfile { get; set; }

    public ICollection<Favorite> Favorites { get; set; } = [];

    public ICollection<Booking> Bookings { get; set; } = [];

    public ICollection<AdoptRequest> AdoptRequests { get; set; } = [];
}
