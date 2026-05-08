using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;

namespace PawFinds.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken = default)
    {
        // Seed SuperAdmin user (global, not tied to any organization)
        await SeedSuperAdminAsync(context, passwordHasher, cancellationToken);

        // Seed demo organization + admin + staff (only if no organizations exist)
        if (await context.Organizations.IgnoreQueryFilters().AnyAsync(cancellationToken))
        {
            return;
        }

        var organization = new Organization
        {
            Name = "PawFinds Demo",
            Slug = "pawfinds-demo",
            IsActive = true
        };

        context.Organizations.Add(organization);
        await context.SaveChangesAsync(cancellationToken);

        var admin = new User
        {
            OrganizationId = organization.Id,
            Email = "admin@pawfinds.com",
            FullName = "Organization Admin",
            Role = RoleType.Admin,
            IsActive = true
        };
        admin.PasswordHash = passwordHasher.HashPassword(admin, "Admin@123");

        var staff = new User
        {
            OrganizationId = organization.Id,
            Email = "staff@pawfinds.com",
            FullName = "Organization Staff",
            Role = RoleType.Staff,
            IsActive = true
        };
        staff.PasswordHash = passwordHasher.HashPassword(staff, "Staff@123");

        context.Users.Add(admin);
        context.Users.Add(staff);

        await context.SaveChangesAsync(cancellationToken);
    }

    private static async Task SeedSuperAdminAsync(
        AppDbContext context,
        IPasswordHasher<User> passwordHasher,
        CancellationToken cancellationToken)
    {
        var superAdminExists = await context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == "superadmin@pawfinds.com", cancellationToken);

        if (superAdminExists)
        {
            return;
        }

        // Create Platform organization first
        var platformOrg = new Organization
        {
            Name = "Platform",
            Slug = "platform",
            IsActive = true
        };

        context.Organizations.Add(platformOrg);
        await context.SaveChangesAsync(cancellationToken);

        var superAdmin = new User
        {
            OrganizationId = platformOrg.Id,
            Email = "superadmin@pawfinds.com",
            FullName = "Super Admin",
            Role = RoleType.SuperAdmin,
            IsActive = true
        };
        superAdmin.PasswordHash = passwordHasher.HashPassword(superAdmin, "Super@123");

        context.Users.Add(superAdmin);
        await context.SaveChangesAsync(cancellationToken);
    }
}
