using System.Text.Json.Serialization;

namespace PawFinds.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum AdoptionStatus
{
    Available = 1,
    ApplicationReceived = 2,
    UnderReview = 3,
    Approved = 4,
    Completed = 5
}
