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

        // Seed demo organizations + users (only if SlackEnterprise doesn't exist)
        if (await context.Organizations.IgnoreQueryFilters().AnyAsync(o => o.Slug == "demo-enterprise", cancellationToken))
        {
            return;
        }

        var enterpriseOrg = new Organization
        {
            Name = "Demo Enterprise SARL",
            Slug = "demo-enterprise",
            IsActive = true
        };
        context.Organizations.Add(enterpriseOrg);

        var vetOrg = new Organization
        {
            Name = "Demo Vet Clinic",
            Slug = "demo-vet",
            IsActive = true
        };
        context.Organizations.Add(vetOrg);

        await context.SaveChangesAsync(cancellationToken);

        var enterprise = new User
        {
            OrganizationId = enterpriseOrg.Id,
            Email = "enterprise@pawfinds.com",
            FullName = "Enterprise Manager",
            Role = RoleType.Enterprise,
            IsActive = true,
            PhoneNumber = "+212 6XX XX XX XX"
        };
        enterprise.PasswordHash = passwordHasher.HashPassword(enterprise, "Enterprise@123");

        var veterinaire = new User
        {
            OrganizationId = vetOrg.Id,
            Email = "vet@pawfinds.com",
            FullName = "Dr. Vet Clinic",
            Role = RoleType.Veterinaire,
            IsActive = true,
            PhoneNumber = "+212 6XX XX XX XX"
        };
        veterinaire.PasswordHash = passwordHasher.HashPassword(veterinaire, "Vet@123");

        var client = new User
        {
            OrganizationId = enterpriseOrg.Id,
            Email = "client@pawfinds.com",
            FullName = "Client User",
            Role = RoleType.Client,
            IsActive = true,
            PhoneNumber = "+212 6XX XX XX XX"
        };
        client.PasswordHash = passwordHasher.HashPassword(client, "Client@123");

        context.Users.Add(enterprise);
        context.Users.Add(veterinaire);
        context.Users.Add(client);

        await context.SaveChangesAsync(cancellationToken);

        // Seed CompanyProfile for enterprise
        var companyProfile = new CompanyProfile
        {
            OrganizationId = enterpriseOrg.Id,
            CompanyName = "Demo Enterprise SARL",
            Description = "A responsible pet adoption company.",
            Location = "Casablanca, Morocco",
            Phone = "+212 5XX XX XX XX",
            Email = "contact@demoenterprise.ma",
            GoogleMapsUrl = "https://maps.google.com/maps?q=33.5731,-7.5898&z=15"
        };
        context.CompanyProfiles.Add(companyProfile);

        // Seed VeterinaireProfile
        var vetProfile = new VeterinaireProfile
        {
            UserId = veterinaire.Id,
            OrganizationId = vetOrg.Id,
            ClinicName = "Demo Vet Clinic",
            Location = "Rabat, Morocco",
            Phone = "+212 5XX XX XX XX",
            Description = "Comprehensive veterinary services for your pets.",
            Latitude = 34.0209,
            Longitude = -6.8416,
            GoogleMapsUrl = "https://maps.google.com/maps?q=34.0209,-6.8416&z=15",
            Formation = "Doctorate in Veterinary Medicine",
            IsAvailable = true
        };
        context.VeterinaireProfiles.Add(vetProfile);

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
