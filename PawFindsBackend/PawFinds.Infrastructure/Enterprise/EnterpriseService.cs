using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Common;
using PawFinds.Application.Enterprise;
using PawFinds.Application.MultiTenancy;
using PawFinds.Application.Pets;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Enterprise;

public sealed class EnterpriseService : IEnterpriseService
{
    private readonly AppDbContext _db;
    private readonly ITenantService _tenant;

    public EnterpriseService(AppDbContext db, ITenantService tenant)
    {
        _db = db;
        _tenant = tenant;
    }

    public async Task<CompanyProfileDto> GetCompanyProfileAsync(Guid organizationId, CancellationToken ct)
    {
        var profile = await _db.CompanyProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(cp => cp.OrganizationId == organizationId, ct);

        if (profile is null)
            throw new InvalidOperationException("Company profile not found.");

        return ToProfileDto(profile);
    }

    public async Task<CompanyProfileDto> UpdateCompanyProfileAsync(Guid organizationId, UpdateCompanyProfileRequest request, CancellationToken ct)
    {
        var profile = await _db.CompanyProfiles
            .FirstOrDefaultAsync(cp => cp.OrganizationId == organizationId, ct);

        if (profile is null)
        {
            profile = new CompanyProfile
            {
                Id = Guid.NewGuid(),
                OrganizationId = organizationId
            };
            _db.CompanyProfiles.Add(profile);
        }

        profile.CompanyName = request.CompanyName;
        profile.Description = request.Description;
        profile.LogoUrl = request.LogoUrl;
        profile.Location = request.Location;
        profile.Phone = request.Phone;
        profile.Email = request.Email;
        profile.Website = request.Website;
        profile.Latitude = request.Latitude;
        profile.Longitude = request.Longitude;
        profile.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToProfileDto(profile);
    }

    public async Task<IReadOnlyList<PetDto>> GetEnterprisePetsAsync(Guid organizationId, CancellationToken ct)
    {
        return await _db.Pets
            .AsNoTracking()
            .Where(p => p.OrganizationId == organizationId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToPetDto(p))
            .ToListAsync(ct);
    }

    public async Task<PetDto> CreatePetAsync(Guid organizationId, Guid ownerId, CreatePetRequest request, CancellationToken ct)
    {
        var petCount = await _db.Pets.CountAsync(p => p.OrganizationId == organizationId, ct);
        if (petCount >= 6)
            throw new InvalidOperationException("Maximum 6 pets per enterprise.");

        var pet = new Pet
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            OwnerId = ownerId,
            Name = request.Name.Trim(),
            Breed = string.IsNullOrWhiteSpace(request.Breed) ? null : request.Breed.Trim(),
            Age = request.Age,
            Type = request.Type.Trim(),
            Location = request.Location.Trim(),
            Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim(),
            ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim(),
            ImageFileName = string.IsNullOrWhiteSpace(request.ImageFileName) ? null : request.ImageFileName.Trim(),
            Status = AdoptionStatus.Available,
            IsVaccinated = request.IsVaccinated,
            IsSterilized = request.IsSterilized,
            IsDewormed = request.IsDewormed,
            HealthNotes = string.IsNullOrWhiteSpace(request.HealthNotes) ? null : request.HealthNotes.Trim(),
            GoodWithKids = request.GoodWithKids,
            GoodWithDogs = request.GoodWithDogs,
            GoodWithCats = request.GoodWithCats,
            BehaviorNotes = string.IsNullOrWhiteSpace(request.BehaviorNotes) ? null : request.BehaviorNotes.Trim()
        };

        _db.Pets.Add(pet);
        await _db.SaveChangesAsync(ct);

        if (request.ProductIds is { Count: > 0 })
            await SetPetProductsInternalAsync(pet.Id, organizationId, request.ProductIds, ct);

        return ToPetDto(pet);
    }

    public async Task<bool> UpdatePetAsync(Guid petId, Guid organizationId, UpdatePetRequest request, CancellationToken ct)
    {
        var pet = await _db.Pets
            .Include(p => p.Products)
            .FirstOrDefaultAsync(p => p.Id == petId && p.OrganizationId == organizationId, ct);
        if (pet is null) return false;

        pet.Name = request.Name.Trim();
        pet.Breed = string.IsNullOrWhiteSpace(request.Breed) ? null : request.Breed.Trim();
        pet.Age = request.Age;
        pet.Type = request.Type.Trim();
        pet.Location = request.Location.Trim();
        pet.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        pet.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        pet.ImageFileName = string.IsNullOrWhiteSpace(request.ImageFileName) ? null : request.ImageFileName.Trim();
        pet.Status = request.Status;
        pet.IsVaccinated = request.IsVaccinated;
        pet.IsSterilized = request.IsSterilized;
        pet.IsDewormed = request.IsDewormed;
        pet.HealthNotes = string.IsNullOrWhiteSpace(request.HealthNotes) ? null : request.HealthNotes.Trim();
        pet.GoodWithKids = request.GoodWithKids;
        pet.GoodWithDogs = request.GoodWithDogs;
        pet.GoodWithCats = request.GoodWithCats;
        pet.BehaviorNotes = string.IsNullOrWhiteSpace(request.BehaviorNotes) ? null : request.BehaviorNotes.Trim();
        pet.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);

        if (request.ProductIds is { Count: > 0 })
            await SetPetProductsInternalAsync(petId, organizationId, request.ProductIds, ct);

        return true;
    }

    public async Task<bool> DeletePetAsync(Guid petId, Guid organizationId, CancellationToken ct)
    {
        var pet = await _db.Pets
            .FirstOrDefaultAsync(p => p.Id == petId && p.OrganizationId == organizationId, ct);
        if (pet is null) return false;

        var hasActiveAdoptions = await _db.Adoptions
            .AnyAsync(a => a.PetId == petId
                && a.OrganizationId == organizationId
                && a.Status != AdoptionStatus.Completed, ct);

        if (hasActiveAdoptions)
            throw new InvalidOperationException("Cannot delete this pet. There are active adoption requests. Please reject them first.");

        _db.Pets.Remove(pet);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<ProductDto>> GetPetProductsAsync(Guid petId, Guid organizationId, CancellationToken ct)
    {
        return await _db.Products
            .AsNoTracking()
            .Where(p => p.PetId == petId && p.OrganizationId == organizationId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToProductDto(p))
            .ToListAsync(ct);
    }

    public async Task<ProductDto> CreateProductAsync(Guid organizationId, CreateProductRequest request, CancellationToken ct)
    {
        if (request.PetId.HasValue)
        {
            var petExists = await _db.Pets.AnyAsync(p => p.Id == request.PetId && p.OrganizationId == organizationId, ct);
            if (!petExists)
                throw new InvalidOperationException("Pet not found.");

            var productCount = await _db.Products.CountAsync(p => p.PetId == request.PetId, ct);
            if (productCount >= 4)
                throw new InvalidOperationException("Maximum 4 products per pet.");
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            PetId = request.PetId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl?.Trim()
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);
        return ToProductDto(product);
    }

    public async Task<bool> DeleteProductAsync(Guid productId, Guid organizationId, CancellationToken ct)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.OrganizationId == organizationId, ct);
        if (product is null) return false;

        _db.Products.Remove(product);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<ProductDto>> GetCatalogAsync(Guid organizationId, CancellationToken ct)
    {
        return await _db.Products
            .AsNoTracking()
            .Where(p => p.OrganizationId == organizationId && p.PetId == null)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => ToProductDto(p))
            .ToListAsync(ct);
    }

    public async Task<ProductDto> CreateCatalogProductAsync(Guid organizationId, CreateProductRequest request, CancellationToken ct)
    {
        var product = new Product
        {
            Id = Guid.NewGuid(),
            OrganizationId = organizationId,
            PetId = null,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            Price = request.Price,
            ImageUrl = request.ImageUrl?.Trim()
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);
        return ToProductDto(product);
    }

    public async Task<bool> DeleteCatalogProductAsync(Guid productId, Guid organizationId, CancellationToken ct)
    {
        var product = await _db.Products
            .FirstOrDefaultAsync(p => p.Id == productId && p.OrganizationId == organizationId && p.PetId == null, ct);
        if (product is null) return false;

        _db.Products.Remove(product);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task SetPetProductsAsync(Guid petId, Guid organizationId, List<Guid> productIds, CancellationToken ct)
    {
        await SetPetProductsInternalAsync(petId, organizationId, productIds, ct);
    }

    private async Task SetPetProductsInternalAsync(Guid petId, Guid organizationId, List<Guid> productIds, CancellationToken ct)
    {
        var pet = await _db.Pets
            .Include(p => p.Products)
            .FirstOrDefaultAsync(p => p.Id == petId && p.OrganizationId == organizationId, ct);
        if (pet is null) return;

        var maxPerPet = 4;
        if (productIds.Count > maxPerPet)
            throw new InvalidOperationException($"Maximum {maxPerPet} products per pet.");

        var allProducts = await _db.Products
            .Where(p => p.OrganizationId == organizationId && productIds.Contains(p.Id))
            .ToListAsync(ct);

        foreach (var product in allProducts)
        {
            product.PetId = petId;
        }

        // Unlink products that were previously linked but not in the new list
        foreach (var product in pet.Products)
        {
            if (!productIds.Contains(product.Id))
            {
                product.PetId = null;
            }
        }

        await _db.SaveChangesAsync(ct);
    }

    public async Task<IReadOnlyList<AdoptionDto>> GetPetAdoptionsAsync(Guid petId, Guid organizationId, CancellationToken ct)
    {
        return await _db.Adoptions
            .AsNoTracking()
            .Include(a => a.Adopter)
            .Include(a => a.Pet)
            .Where(a => a.PetId == petId && a.OrganizationId == organizationId)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => ToAdoptionDto(a))
            .ToListAsync(ct);
    }

    public async Task<bool> RespondToAdoptionAsync(Guid adoptionId, Guid organizationId, AdoptionStatus newStatus, string? notes, CancellationToken ct)
    {
        var adoption = await _db.Adoptions
            .FirstOrDefaultAsync(a => a.Id == adoptionId && a.OrganizationId == organizationId, ct);
        if (adoption is null) return false;

        adoption.Status = newStatus;
        adoption.AdminNotes = notes;
        adoption.UpdatedAt = DateTimeOffset.UtcNow;

        if (newStatus == AdoptionStatus.Completed)
        {
            adoption.CompletedAt = DateTimeOffset.UtcNow;
            var pet = await _db.Pets.FirstOrDefaultAsync(p => p.Id == adoption.PetId, ct);
            if (pet is not null)
            {
                pet.Status = AdoptionStatus.Completed;
                pet.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        await _db.SaveChangesAsync(ct);
        return true;
    }

    private static CompanyProfileDto ToProfileDto(CompanyProfile cp) => new(
        cp.Id, cp.OrganizationId, cp.CompanyName, cp.Description, cp.LogoUrl,
        cp.Location, cp.Phone, cp.Email, cp.Website, cp.Latitude, cp.Longitude);

    private static PetDto ToPetDto(Pet p) => new(
        p.Id, p.OrganizationId, p.OwnerId, null, p.Name, p.Breed, p.Age,
        p.Type, p.Location, p.Description, p.ImageUrl, p.ImageFileName,
        p.Status, p.IsVaccinated, p.IsSterilized, p.IsDewormed, p.HealthNotes,
        p.GoodWithKids, p.GoodWithDogs, p.GoodWithCats, p.BehaviorNotes,
        p.CreatedAt, p.UpdatedAt);

    private static ProductDto ToProductDto(Product p) => new(
        p.Id, p.PetId, p.Name, p.Description, p.Price, p.ImageUrl, p.CreatedAt);

    private static AdoptionDto ToAdoptionDto(Adoption a) => new(
        a.Id, a.PetId, a.AdopterId, a.Adopter?.FullName, a.Pet?.Name,
        a.Status, a.ApplicationMessage, a.AdminNotes, a.CompletedAt, a.CreatedAt,
        a.Adopter?.ProfilePictureUrl);
}


