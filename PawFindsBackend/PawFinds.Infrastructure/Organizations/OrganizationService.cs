using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PawFinds.Application.MultiTenancy;
using PawFinds.Application.Organizations;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Organizations;

public sealed class OrganizationService : IOrganizationService
{
    private readonly AppDbContext _dbContext;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITenantService _tenantService;

    public OrganizationService(
        AppDbContext dbContext,
        IPasswordHasher<User> passwordHasher,
        ITenantService tenantService)
    {
        _dbContext = dbContext;
        _passwordHasher = passwordHasher;
        _tenantService = tenantService;
    }

    public async Task<(Guid userId, string tempPassword)> InviteUserAsync(
        string email,
        string fullName,
        RoleType role,
        Guid organizationId,
        CancellationToken cancellationToken)
    {
        var emailExists = await _dbContext.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == email, cancellationToken);

        if (emailExists)
            throw new InvalidOperationException("Email already exists.");

        var tempPassword = GenerateTempPassword();

        var user = new User
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            Email = email,
            FullName = fullName,
            Role = role,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, tempPassword);

        _dbContext.Users.Add(user);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return (user.Id, tempPassword);
    }

    private static string GenerateTempPassword()
    {
        var guid = Guid.NewGuid().ToString("N");
        return $"Temp@{guid.Substring(0, 8)}!";
    }
}
