using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.Notifications;

public interface INotificationService
{
    Task<IReadOnlyList<NotificationDto>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken);

    Task<bool> MarkAsReadAsync(
        Guid notificationId,
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken);

    Task<int> MarkAllAsReadAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken);

    void AddAdoptionStatusChangedNotification(
        Adoption adoption,
        AdoptionStatus newStatus);
}
