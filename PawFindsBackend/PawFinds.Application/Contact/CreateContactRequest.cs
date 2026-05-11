using System.ComponentModel.DataAnnotations;

namespace PawFinds.Application.Contact;

public sealed class CreateContactRequest
{
    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}
