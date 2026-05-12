using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.AdoptedPets;
using PawFinds.Application.Common;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/adopted-pets")]
public sealed class AdoptedPetsController : ControllerBase
{
    private readonly IAdoptedPetsService _service;

    public AdoptedPetsController(IAdoptedPetsService service)
    {
        _service = service;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<AdoptedPetDto>>> GetAdoptedPets(
        [FromQuery] AdoptedPetQueryParameters query,
        CancellationToken ct)
    {
        return Ok(await _service.GetAdoptedPetsAsync(query, ct));
    }
}
