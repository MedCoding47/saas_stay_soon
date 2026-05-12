using Microsoft.EntityFrameworkCore;
using PawFinds.Application.AdoptedPets;
using PawFinds.Application.Common;
using PawFinds.Domain.Enums;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.AdoptedPets;

public sealed class AdoptedPetsService : IAdoptedPetsService
{
    private readonly AppDbContext _db;

    public AdoptedPetsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<AdoptedPetDto>> GetAdoptedPetsAsync(
        AdoptedPetQueryParameters query, CancellationToken ct)
    {
        var adoptions = _db.Adoptions
            .AsNoTracking()
            .Include(a => a.Pet)
            .Include(a => a.Adopter)
            .Include(a => a.Organization)
            .Where(a => a.Status == AdoptionStatus.Completed)
            .OrderByDescending(a => a.CompletedAt);

        var total = await adoptions.CountAsync(ct);

        var items = await adoptions
            .Skip((query.PageNumber - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(a => new AdoptedPetDto(
                a.Pet!.Id,
                a.Pet.Name,
                a.Pet.Breed,
                a.Pet.Age,
                a.Pet.Type,
                a.Pet.Location,
                a.Pet.ImageUrl,
                a.Adopter!.FullName,
                a.Organization!.Name,
                a.CompletedAt ?? a.CreatedAt,
                a.CompletedAt))
            .ToListAsync(ct);

        var totalPages = (int)Math.Ceiling((double)total / query.PageSize);

        return new PagedResult<AdoptedPetDto>(items, query.PageNumber, query.PageSize, total, totalPages);
    }
}
