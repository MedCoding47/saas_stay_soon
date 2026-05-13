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
            .Include(v => v.Organization)
            .Where(v => v.Organization!.IsActive)
            .OrderBy(v => v.ClinicName)
            .Select(v => new
            {
                v.ClinicName,
                v.Location,
                v.GoogleMapsUrl,
                v.Phone
            })
            .ToListAsync(ct);

        return Ok(vets);
    }
}
