using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Common;
using PawFinds.Application.Pets;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/pets")]
public sealed class PetsController : ControllerBase
{
    private readonly IPetService _petService;

    public PetsController(IPetService petService)
    {
        _petService = petService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<PetDto>>> GetPets(
        [FromQuery] PetQueryParameters query,
        CancellationToken cancellationToken)
    {
        var pets = await _petService.GetPetsAsync(query, cancellationToken);

        return Ok(pets);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PetDto>> GetPet(
        Guid id,
        CancellationToken cancellationToken)
    {
        var pet = await _petService.GetPetByIdAsync(id, cancellationToken);

        return pet is null ? NotFound() : Ok(pet);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<PetDto>> CreatePet(
        CreatePetRequest request,
        CancellationToken cancellationToken)
    {
        var pet = await _petService.CreatePetAsync(request, cancellationToken);

        return CreatedAtAction(nameof(GetPet), new { id = pet.Id }, pet);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> UpdatePet(
        Guid id,
        UpdatePetRequest request,
        CancellationToken cancellationToken)
    {
        var updated = await _petService.UpdatePetAsync(id, request, cancellationToken);

        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<IActionResult> DeletePet(
        Guid id,
        CancellationToken cancellationToken)
    {
        var deleted = await _petService.DeletePetAsync(id, cancellationToken);

        return deleted ? NoContent() : NotFound();
    }
}
