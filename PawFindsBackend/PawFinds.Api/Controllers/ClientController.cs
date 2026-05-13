using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Client;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "Client")]
[Route("api/client")]
public sealed class ClientController : ControllerBase
{
    private readonly IClientService _service;
    private readonly AppDbContext _db;

    public ClientController(IClientService service, AppDbContext db)
    {
        _service = service;
        _db = db;
    }

    [HttpGet("favorites")]
    public async Task<ActionResult<IReadOnlyList<FavoriteDto>>> GetFavorites(CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.GetFavoritesAsync(userId, ct));
    }

    [HttpPost("favorites/{petId:guid}")]
    public async Task<ActionResult<FavoriteDto>> AddFavorite(Guid petId, CancellationToken ct)
    {
        var userId = GetUserId();
        try
        {
            var fav = await _service.AddFavoriteAsync(userId, petId, ct);
            return Ok(fav);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("favorites/{petId:guid}")]
    public async Task<IActionResult> RemoveFavorite(Guid petId, CancellationToken ct)
    {
        var userId = GetUserId();
        var removed = await _service.RemoveFavoriteAsync(userId, petId, ct);
        return removed ? NoContent() : NotFound();
    }

    [HttpGet("adoption-count")]
    public async Task<ActionResult<int>> GetAdoptionCount(CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.GetAdoptionCountAsync(userId, ct));
    }

    [HttpPost("adopt-requests")]
    public async Task<ActionResult<AdoptRequestDto>> SubmitAdoptRequest(SubmitAdoptRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        var orgId = await GetOrgIdAsync();
        var result = await _service.SubmitAdoptRequestAsync(userId, orgId, request, ct);
        return Ok(result);
    }

    [HttpGet("adopt-requests")]
    public async Task<ActionResult<IReadOnlyList<AdoptRequestDto>>> GetAdoptRequests(CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.GetMyAdoptRequestsAsync(userId, ct));
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }

    private async Task<Guid> GetOrgIdAsync()
    {
        var claim = User.FindFirstValue("organization_id");
        if (claim is not null && Guid.TryParse(claim, out var orgId))
            return orgId;
        var platform = await _db.Organizations
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(o => o.Slug == "platform");
        return platform?.Id ?? Guid.Empty;
    }
}
