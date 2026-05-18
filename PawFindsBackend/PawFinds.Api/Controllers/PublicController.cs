using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Api.Controllers;

[ApiController]
[Route("api/public")]
public sealed class PublicController : ControllerBase
{
    private readonly AppDbContext _db;

    public PublicController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("companies")]
    public async Task<ActionResult> GetCompanies(CancellationToken ct)
    {
        var companies = await _db.CompanyProfiles
            .Include(c => c.Organization)
            .Where(c => c.Organization!.IsActive)
            .OrderBy(c => c.CompanyName)
            .Select(c => new
            {
                c.CompanyName,
                c.Location,
                c.GoogleMapsUrl,
                c.Phone
            })
            .ToListAsync(ct);

        return Ok(companies);
    }

    [HttpGet("veterinaires")]
    public async Task<ActionResult> GetVeterinaires(CancellationToken ct)
    {
        var vets = await _db.VeterinaireProfiles
            .AsNoTracking()
            .Include(v => v.Organization)
            .Include(v => v.User)
            .Include(v => v.AdviceList)
            .Include(v => v.Recommendations)
            .Where(v => v.Organization!.IsActive && v.IsAvailable)
            .OrderBy(v => v.ClinicName)
            .Select(v => new
            {
                v.ClinicName,
                v.Location,
                v.Phone,
                v.Description,
                v.Latitude,
                v.Longitude,
                v.GoogleMapsUrl,
                v.Formation,
                UserName = v.User!.FullName,
                UserEmail = v.User.Email,
                ProfilePictureUrl = v.User.ProfilePictureUrl,
                AdviceList = v.AdviceList
                    .OrderByDescending(a => a.CreatedAt)
                    .Take(2)
                    .Select(a => new { a.Title, a.Content })
                    .ToList(),
                Recommendations = v.Recommendations
                    .OrderByDescending(r => r.CreatedAt)
                    .Select(r => new { r.Title, r.Description, r.TargetSpecies, r.TargetAgeRange })
                    .ToList()
            })
            .ToListAsync(ct);

        return Ok(vets);
    }
}
