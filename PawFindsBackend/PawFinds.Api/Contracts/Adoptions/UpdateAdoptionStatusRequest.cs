using System.ComponentModel.DataAnnotations;
using PawFinds.Domain.Enums;

namespace PawFinds.Api.Contracts.Adoptions;

public sealed class UpdateAdoptionStatusRequest
{
    [EnumDataType(typeof(AdoptionStatus))]
    public AdoptionStatus Status { get; set; }

    [MaxLength(2000)]
    public string? AdminNotes { get; set; }
}
