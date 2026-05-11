using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Common;
using PawFinds.Application.Pets;

namespace PawFinds.Api.Controllers;

[ApiController]
[Route("api/pets")]
public sealed class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<PetDto>>> GetPets(
        [FromQuery] PetQueryParameters query,
        CancellationToken cancellationToken)
    {
        var pets = await _petService.GetPetsAsync(query, cancellationToken);

        return Ok(pets);
    }

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult<PetDto>> GetPet(
        Guid id,
        CancellationToken cancellationToken)
    {
        var pet = await _petService.GetPetByIdAsync(id, cancellationToken);

        return pet is null ? NotFound() : Ok(pet);
    }

    [HttpGet("my")]
    [Authorize(Roles = "PetHolder,Admin")]
    public async Task<ActionResult<IReadOnlyList<PetDto>>> GetMyPets(
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
            return Unauthorized();

        var pets = await _petService.GetMyPetsAsync(ownerId, cancellationToken);

        return Ok(pets);
    }

    [HttpPost]
    [Authorize(Roles = "PetHolder,Admin,Staff")]
    public async Task<ActionResult<PetDto>> CreatePet(
        CreatePetRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var ownerId))
            return Unauthorized();

        var pet = await _petService.CreatePetAsync(request, ownerId, cancellationToken);

        return CreatedAtAction(nameof(GetPet), new { id = pet.Id }, pet);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "PetHolder,Admin,Staff")]
    public async Task<IActionResult> UpdatePet(
        Guid id,
        UpdatePetRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _petService.UpdatePetAsync(id, request, cancellationToken);

        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "PetHolder,Admin,Staff")]
    public async Task<IActionResult> DeletePet(
        Guid id,
        CancellationToken cancellationToken)
    {
        var deleted = await _petService.DeletePetAsync(id, cancellationToken);

        return deleted ? NoContent() : NotFound();
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("user_id");
        return Guid.TryParse(userIdClaim, out userId);
    }
}
