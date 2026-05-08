using System.ComponentModel.DataAnnotations;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.Adoptions;

public sealed class TransitionAdoptionRequest
{
    [EnumDataType(typeof(AdoptionStatus))]
    public AdoptionStatus Status { get; set; }

    [MaxLength(2000)]
    public string? AdminNotes { get; set; }
}
