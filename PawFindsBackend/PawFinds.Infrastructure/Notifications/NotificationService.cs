using Microsoft.EntityFrameworkCore;
using PawFinds.Application.MultiTenancy;
using PawFinds.Application.Notifications;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Notifications;

public sealed class NotificationService : INotificationService
{
    private readonly AppDbContext _dbContext;
    private readonly ITenantService _tenantService;

    public NotificationService(AppDbContext dbContext, ITenantService tenantService)
    {
        _dbContext = dbContext;
        _tenantService = tenantService;
    }

    public async Task<IReadOnlyList<NotificationDto>> GetForUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        EnsureTenant();

        return await _dbContext.Notifications
            .AsNoTracking()
            .Where(notification => notification.UserId == userId)
            .OrderByDescending(notification => notification.CreatedAt)
            .Select(notification => new NotificationDto(
                notification.Id,
                notification.UserId,
                notification.Content,
                notification.IsRead,
                notification.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> MarkAsReadAsync(
        Guid notificationId,
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var notification = await _dbContext.Notifications
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(n => n.Id == notificationId, cancellationToken);

        if (notification == null)
            return false;

        if (notification.UserId != userId || notification.OrganizationId != organizationId)
            return false;

        notification.IsRead = true;
        notification.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<int> MarkAllAsReadAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var notifications = await _dbContext.Notifications
            .IgnoreQueryFilters()
            .Where(n => n.UserId == userId
                && n.OrganizationId == organizationId
                && !n.IsRead)
            .ToListAsync(cancellationToken);

        if (!notifications.Any())
            return 0;

        var now = DateTimeOffset.UtcNow;

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.UpdatedAt = now;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return notifications.Count;
    }

    public void AddAdoptionStatusChangedNotification(
        Adoption adoption,
        AdoptionStatus newStatus)
    {
        EnsureTenant();

        var notification = new Notification
        {
            Id = Guid.NewGuid(),
            OrganizationId = adoption.OrganizationId,
            UserId = adoption.AdopterId,
            Content = $"Your adoption application status changed to {newStatus}.",
            IsRead = false
        };

        _dbContext.Notifications.Add(notification);
    }

    private Guid EnsureTenant()
    {
        return _tenantService.OrganizationId
            ?? throw new UnauthorizedAccessException("Organization context is missing.");
    }
}
