using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Contact;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Contact;

public sealed class ContactService : IContactService
{
    private readonly AppDbContext _dbContext;

    public ContactService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<ContactRequestDto> CreateContactRequestAsync(
        Guid userId,
        string subject,
        string message,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var contactRequest = new ContactRequest
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            UserId = userId,
            Subject = subject,
            Message = message,
            IsRead = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.ContactRequests.Add(contactRequest);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var user = await _dbContext.Users
            .IgnoreQueryFilters()
            .FirstAsync(u => u.Id == userId, cancellationToken);

        return new ContactRequestDto(
            contactRequest.Id,
            user.Id,
            user.FullName,
            user.Email,
            contactRequest.Subject,
            contactRequest.Message,
            contactRequest.IsRead,
            contactRequest.CreatedAt);
    }

    public async Task<IReadOnlyList<ContactRequestDto>> GetContactRequestsAsync(
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        return await _dbContext.ContactRequests
            .IgnoreQueryFilters()
            .Where(cr => cr.OrganizationId == organizationId)
            .Include(cr => cr.User)
            .OrderByDescending(cr => cr.CreatedAt)
            .Select(cr => new ContactRequestDto(
                cr.Id,
                cr.UserId,
                cr.User!.FullName,
                cr.User.Email,
                cr.Subject,
                cr.Message,
                cr.IsRead,
                cr.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> MarkAsReadAsync(
        Guid contactRequestId,
        CancellationToken cancellationToken)
    {
        var contactRequest = await _dbContext.ContactRequests
            .FirstOrDefaultAsync(cr => cr.Id == contactRequestId, cancellationToken);

        if (contactRequest is null)
            return false;

        contactRequest.IsRead = true;
        contactRequest.UpdatedAt = DateTimeOffset.UtcNow;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }
}
