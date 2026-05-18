using Microsoft.EntityFrameworkCore;
using PawFinds.Application.MultiTenancy;
using PawFinds.Domain.Common;
using PawFinds.Domain.Entities;

namespace PawFinds.Infrastructure.Persistence;

public sealed class AppDbContext : DbContext
{
    private readonly ITenantService _tenantService;

    public AppDbContext(
        DbContextOptions<AppDbContext> options,
        ITenantService tenantService)
        : base(options)
    {
        _tenantService = tenantService;
    }

    public Guid? CurrentOrganizationId => _tenantService.OrganizationId;

    public DbSet<User> Users => Set<User>();

    public DbSet<Organization> Organizations => Set<Organization>();

    public DbSet<Pet> Pets => Set<Pet>();

    public DbSet<Adoption> Adoptions => Set<Adoption>();

    public DbSet<Notification> Notifications => Set<Notification>();

    public DbSet<Message> Messages => Set<Message>();

    public DbSet<Conversation> Conversations => Set<Conversation>();

    public DbSet<ContactRequest> ContactRequests => Set<ContactRequest>();

    public DbSet<CompanyProfile> CompanyProfiles => Set<CompanyProfile>();

    public DbSet<Product> Products => Set<Product>();

    public DbSet<Favorite> Favorites => Set<Favorite>();

    public DbSet<VeterinaireProfile> VeterinaireProfiles => Set<VeterinaireProfile>();

    public DbSet<Advice> Advice => Set<Advice>();

    public DbSet<Booking> Bookings => Set<Booking>();

    public DbSet<PetCareRecommendation> PetCareRecommendations => Set<PetCareRecommendation>();

    public DbSet<AdoptRequest> AdoptRequests => Set<AdoptRequest>();

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = now;
            }

            if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

        modelBuilder.Entity<User>()
            .HasQueryFilter(user =>
                CurrentOrganizationId == null ||
                user.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Pet>()
            .HasQueryFilter(pet =>
                CurrentOrganizationId == null ||
                pet.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Adoption>()
            .HasQueryFilter(adoption =>
                CurrentOrganizationId == null ||
                adoption.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Notification>()
            .HasQueryFilter(notification =>
                CurrentOrganizationId == null ||
                notification.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Message>()
            .HasQueryFilter(m =>
                CurrentOrganizationId == null ||
                m.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Conversation>()
            .HasQueryFilter(c =>
                CurrentOrganizationId == null ||
                c.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<ContactRequest>()
            .HasQueryFilter(cr =>
                CurrentOrganizationId == null ||
                cr.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Product>()
            .HasQueryFilter(p =>
                CurrentOrganizationId == null ||
                p.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<CompanyProfile>()
            .HasQueryFilter(cp =>
                CurrentOrganizationId == null ||
                cp.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<VeterinaireProfile>()
            .HasQueryFilter(vp =>
                CurrentOrganizationId == null ||
                vp.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<AdoptRequest>()
            .HasQueryFilter(ar =>
                CurrentOrganizationId == null ||
                ar.OrganizationId == CurrentOrganizationId);

        modelBuilder.Entity<Booking>()
            .HasQueryFilter(b =>
                CurrentOrganizationId == null ||
                b.VeterinaireProfile!.OrganizationId == CurrentOrganizationId);
    }
}
