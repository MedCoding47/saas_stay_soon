using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Client;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Client;

public sealed class ClientService : IClientService
{
    private readonly AppDbContext _db;

    public ClientService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<FavoriteDto>> GetFavoritesAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Favorites
            .AsNoTracking()
            .Include(f => f.Pet)
            .Where(f => f.UserId == userId)
            .OrderByDescending(f => f.CreatedAt)
            .Select(f => new FavoriteDto(
                f.Id, f.PetId, f.Pet!.Name, f.Pet.ImageUrl, f.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<FavoriteDto> AddFavoriteAsync(Guid userId, Guid petId, CancellationToken ct)
    {
        var exists = await _db.Favorites.AnyAsync(f => f.UserId == userId && f.PetId == petId, ct);
        if (exists)
            throw new InvalidOperationException("Pet already in favorites.");

        var count = await _db.Favorites.CountAsync(f => f.UserId == userId, ct);
        if (count >= 4)
            throw new InvalidOperationException("Maximum 4 favorite pets.");

        var pet = await _db.Pets.AsNoTracking().FirstOrDefaultAsync(p => p.Id == petId, ct);
        if (pet is null)
            throw new InvalidOperationException("Pet not found.");

        var fav = new Favorite
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            PetId = petId
        };

        _db.Favorites.Add(fav);
        await _db.SaveChangesAsync(ct);

        return new FavoriteDto(fav.Id, petId, pet.Name, pet.ImageUrl, fav.CreatedAt);
    }

    public async Task<bool> RemoveFavoriteAsync(Guid userId, Guid petId, CancellationToken ct)
    {
        var fav = await _db.Favorites
            .FirstOrDefaultAsync(f => f.UserId == userId && f.PetId == petId, ct);
        if (fav is null) return false;

        _db.Favorites.Remove(fav);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<int> GetAdoptionCountAsync(Guid userId, CancellationToken ct)
    {
        return await _db.Adoptions
            .CountAsync(a => a.AdopterId == userId, ct);
    }

    public async Task<AdoptRequestDto> SubmitAdoptRequestAsync(Guid userId, Guid organizationId, SubmitAdoptRequest request, CancellationToken ct)
    {
        var entity = new AdoptRequest
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            OrganizationId = organizationId,
            PetName = request.PetName.Trim(),
            Species = request.Species.Trim(),
            Breed = request.Breed?.Trim(),
            Age = request.Age,
            Reason = request.Reason.Trim(),
            Description = request.Description?.Trim(),
            ContactPhone = request.ContactPhone.Trim(),
            ContactEmail = request.ContactEmail.Trim(),
            Status = AdoptRequestStatus.Pending
        };

        _db.AdoptRequests.Add(entity);
        await _db.SaveChangesAsync(ct);

        return ToDto(entity);
    }

    public async Task<IReadOnlyList<AdoptRequestDto>> GetMyAdoptRequestsAsync(Guid userId, CancellationToken ct)
    {
        return await _db.AdoptRequests
            .AsNoTracking()
            .Where(ar => ar.UserId == userId)
            .OrderByDescending(ar => ar.CreatedAt)
            .Select(ar => ToDto(ar))
            .ToListAsync(ct);
    }

    private static AdoptRequestDto ToDto(AdoptRequest ar) => new(
        ar.Id, ar.PetName, ar.Species, ar.Breed, ar.Age, ar.Reason,
        ar.Description, ar.ContactPhone, ar.ContactEmail,
        ar.Status.ToString(), ar.AdminResponse, ar.RespondedAt, ar.CreatedAt);
}
