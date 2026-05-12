using System.Text.Json.Serialization;

namespace PawFinds.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RoleType
{
    SuperAdmin = 0,
    Enterprise = 1,
    Client = 2,
    Veterinaire = 3
}
