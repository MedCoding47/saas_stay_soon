using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Common;
using PawFinds.Application.Messages;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Conversations;

public sealed class ConversationService : IConversationService
{
    private readonly AppDbContext _dbContext;

    public ConversationService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ConversationDto> StartConversationAsync(
        Guid petId,
        Guid adopterId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var pet = await _dbContext.Pets
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == petId && p.OrganizationId == organizationId, cancellationToken)
            ?? throw new InvalidOperationException("Pet not found.");

        if (pet.OwnerId == null)
            throw new InvalidOperationException("This pet is not available for marketplace conversations.");

        var petHolderId = pet.OwnerId.Value;

        var existing = await _dbContext.Conversations
            .IgnoreQueryFilters()
            .Include(c => c.Pet)
            .Include(c => c.PetHolder)
            .Include(c => c.Adopter)
            .FirstOrDefaultAsync(c =>
                c.PetId == petId &&
                c.AdopterId == adopterId &&
                c.IsOpen,
                cancellationToken);

        if (existing is not null)
        {
            return ToDto(existing);
        }

        var conversation = new Conversation
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            PetId = petId,
            PetHolderId = petHolderId,
            AdopterId = adopterId,
            IsOpen = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Conversations.Add(conversation);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new ConversationDto(
            conversation.Id,
            adopterId,
            (await _dbContext.Users.FindAsync(adopterId))?.FullName ?? "Unknown",
            null,
            petId,
            pet.Name,
            pet.ImageUrl,
            true,
            string.Empty,
            conversation.CreatedAt,
            0);
    }

    public async Task<IReadOnlyList<ConversationDto>> GetConversationsForUserAsync(
        Guid userId,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var conversations = await _dbContext.Conversations
            .IgnoreQueryFilters()
            .Where(c => c.OrganizationId == organizationId)
            .Where(c => c.PetHolderId == userId || c.AdopterId == userId)
            .Include(c => c.Pet)
            .Include(c => c.PetHolder)
            .Include(c => c.Adopter)
            .Include(c => c.Messages)
            .OrderByDescending(c => c.Messages
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => m.CreatedAt)
                .FirstOrDefault())
            .ToListAsync(cancellationToken);

        return conversations.Select(c =>
        {
            var isPetHolder = c.PetHolderId == userId;
            var otherUser = isPetHolder ? c.Adopter : c.PetHolder;
            var lastMessage = c.Messages
                .OrderByDescending(m => m.CreatedAt)
                .FirstOrDefault();
            var unreadCount = c.Messages.Count(m =>
                m.RecipientId == userId && !m.IsRead);

            return new ConversationDto(
                c.Id,
                otherUser.Id,
                otherUser.FullName,
                otherUser.ProfilePictureUrl,
                c.Pet.Id,
                c.Pet.Name,
                c.Pet.ImageUrl,
                c.IsOpen,
                lastMessage?.Content ?? string.Empty,
                lastMessage?.CreatedAt ?? c.CreatedAt,
                unreadCount);
        }).ToList();
    }

    public async Task<PagedResult<MessageDto>> GetConversationMessagesAsync(
        Guid conversationId,
        Guid userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken)
    {
        var query = _dbContext.Messages
            .IgnoreQueryFilters()
            .Where(m => m.ConversationId == conversationId);

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
                m.ConversationId,
                m.CreatedAt))
            .ToListAsync(cancellationToken);

        return new PagedResult<MessageDto>(messages, page, pageSize, totalCount, totalPages);
    }

    public async Task<bool> CloseConversationAsync(
        Guid conversationId,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var conversation = await _dbContext.Conversations
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == conversationId, cancellationToken);

        if (conversation is null ||
            (conversation.PetHolderId != userId && conversation.AdopterId != userId))
        {
            return false;
        }

        conversation.IsOpen = false;
        conversation.UpdatedAt = DateTimeOffset.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }

    private static ConversationDto ToDto(Conversation c)
    {
        var lastMessage = c.Messages?
            .OrderByDescending(m => m.CreatedAt)
            .FirstOrDefault();

        return new ConversationDto(
            c.Id,
            c.AdopterId,
            c.Adopter?.FullName ?? "Unknown",
            c.Adopter?.ProfilePictureUrl,
            c.PetId,
            c.Pet?.Name,
            c.Pet?.ImageUrl,
            c.IsOpen,
            lastMessage?.Content ?? string.Empty,
            lastMessage?.CreatedAt ?? c.CreatedAt,
            0);
    }
}
