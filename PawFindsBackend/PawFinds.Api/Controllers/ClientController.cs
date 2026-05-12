using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Client;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "Client")]
[Route("api/client")]
public sealed class ClientController : ControllerBase
{
    private readonly IClientService _service;

    public ClientController(IClientService service)
    {
        _service = service;
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
        var orgId = GetOrgId();
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

    private Guid GetOrgId()
    {
        var claim = User.FindFirstValue("organization_id");
        return Guid.Parse(claim!);
    }
}
