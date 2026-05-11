using System.Text.Json.Serialization;

namespace PawFinds.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoleType
{
    SuperAdmin = 0,
    Admin = 1,
    Staff = 2,
    Adopter = 3,
    Applicant = 4,
    PetHolder = 5
}
