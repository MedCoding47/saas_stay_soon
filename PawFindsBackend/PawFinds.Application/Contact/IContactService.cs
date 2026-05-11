namespace PawFinds.Application.Contact;

public interface IContactService
{
    Task<ContactRequestDto> CreateContactRequestAsync(
        Guid userId,
        string subject,
        string message,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<IReadOnlyList<ContactRequestDto>> GetContactRequestsAsync(
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<bool> MarkAsReadAsync(
        Guid contactRequestId,
        CancellationToken cancellationToken);
}
