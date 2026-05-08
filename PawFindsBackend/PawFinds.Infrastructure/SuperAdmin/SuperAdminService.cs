using Microsoft.EntityFrameworkCore;
using PawFinds.Application.SuperAdmin;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.SuperAdmin;

public sealed class SuperAdminService : ISuperAdminService
{
    private readonly AppDbContext _dbContext;

    public SuperAdminService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> CreateOrganizationAsync(
        string name,
        string slug,
        CancellationToken cancellationToken)
    {
        var slugExists = await _dbContext.Organizations
            .IgnoreQueryFilters()
            .AnyAsync(o => o.Slug == slug, cancellationToken);

        if (slugExists)
            throw new InvalidOperationException("Slug already exists.");

        var organization = new Organization
        {
            Name = name,
            Slug = slug,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _dbContext.Organizations.Add(organization);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return organization.Id;
    }
}
