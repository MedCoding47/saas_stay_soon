using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Common;
using PawFinds.Application.Messages;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Messages;

public sealed class MessageService : IMessageService
{
    private readonly AppDbContext _dbContext;

    public MessageService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<MessageDto> SendMessageAsync(
        Guid senderId,
        Guid recipientId,
        string content,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var senderExists = await _dbContext.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Id == senderId && u.OrganizationId == organizationId, cancellationToken);

        var recipientExists = await _dbContext.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Id == recipientId && u.OrganizationId == organizationId, cancellationToken);

        if (!senderExists || !recipientExists)
            throw new InvalidOperationException("Sender or recipient not found in organization.");

        var message = new Message
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content,
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Messages.Add(message);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var sender = await _dbContext.Users
            .IgnoreQueryFilters()
            .FirstAsync(u => u.Id == senderId, cancellationToken);

        var recipient = await _dbContext.Users
            .IgnoreQueryFilters()
            .FirstAsync(u => u.Id == recipientId, cancellationToken);

        return new MessageDto(
            message.Id,
            sender.Id,
            sender.FullName,
            recipient.Id,
            recipient.FullName,
            message.Content,
            message.IsRead,
            message.CreatedAt);
    }

    public async Task<PagedResult<MessageDto>> GetConversationAsync(
        Guid otherUserId,
        Guid currentUserId,
        Guid organizationId,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Messages
            .IgnoreQueryFilters()
            .Where(m => m.OrganizationId == organizationId)
            .Where(m =>
                (m.SenderId == currentUserId && m.RecipientId == otherUserId) ||
                (m.SenderId == otherUserId && m.RecipientId == currentUserId));

        var totalCount = await query.CountAsync(cancellationToken);
        var totalPages = (int)Math.Ceiling((double)totalCount / pageSize);

        var messages = await query
            .OrderByDescending(m => m.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MessageDto(
                m.Id,
                m.SenderId,
                m.Sender!.FullName,
                m.RecipientId,
                m.Recipient!.FullName,
                m.Content,
                m.IsRead,
                m.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<MessageDto>(messages, page, pageSize, totalCount, totalPages);
    }

    public async Task<IReadOnlyList<ConversationDto>> GetConversationsAsync(
        Guid currentUserId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var messages = await _dbContext.Messages
            .IgnoreQueryFilters()
            .Where(m => m.OrganizationId == organizationId)
            .Where(m => m.SenderId == currentUserId || m.RecipientId == currentUserId)
            .OrderByDescending(m => m.CreatedAt)
            .ToListAsync(cancellationToken);

        var conversations = messages
            .GroupBy(m => m.SenderId == currentUserId ? m.RecipientId : m.SenderId)
            .Select(g =>
            {
                var lastMessage = g.First();
                var otherUserId = g.Key;
                var otherUser = lastMessage.SenderId == currentUserId
                    ? lastMessage.Recipient!
                    : lastMessage.Sender!;

                var unreadCount = g.Count(m =>
                    m.RecipientId == currentUserId && !m.IsRead);

                return new ConversationDto(
                    otherUserId,
                    otherUser.FullName,
                    lastMessage.Content,
                    lastMessage.CreatedAt,
                    unreadCount);
            })
            .OrderByDescending(c => c.LastMessageAt)
            .ToList();

        return conversations;
    }

    public async Task<bool> MarkAsReadAsync(
        Guid messageId,
        Guid currentUserId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var message = await _dbContext.Messages
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(m => m.Id == messageId, cancellationToken);

        if (message == null)
            return false;

        if (message.RecipientId != currentUserId || message.OrganizationId != organizationId)
            return false;

        message.IsRead = true;
        message.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
