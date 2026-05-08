using System.ComponentModel.DataAnnotations;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.Pets;

public sealed class PetQueryParameters
{
    [Range(1, int.MaxValue)]
    public int PageNumber { get; set; } = 1;

    [Range(1, 100)]
    public int PageSize { get; set; } = 20;

    [MaxLength(80)]
    public string? Type { get; set; }

    [MaxLength(160)]
    public string? Location { get; set; }

    public AdoptionStatus? Status { get; set; }
}
