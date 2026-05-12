using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Enterprise;
using PawFinds.Application.Pets;
using PawFinds.Domain.Enums;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "Enterprise")]
[Route("api/enterprise")]
public sealed class EnterpriseController : ControllerBase
{
    private readonly IEnterpriseService _service;

    public EnterpriseController(IEnterpriseService service)
    {
        _service = service;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<CompanyProfileDto>> GetProfile(CancellationToken ct)
    {
        var orgId = GetOrgId();
        return Ok(await _service.GetCompanyProfileAsync(orgId, ct));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<CompanyProfileDto>> UpdateProfile(UpdateCompanyProfileRequest request, CancellationToken ct)
    {
        var orgId = GetOrgId();
        return Ok(await _service.UpdateCompanyProfileAsync(orgId, request, ct));
    }

    [HttpGet("pets")]
    public async Task<ActionResult<IReadOnlyList<PetDto>>> GetPets(CancellationToken ct)
    {
        var orgId = GetOrgId();
        return Ok(await _service.GetEnterprisePetsAsync(orgId, ct));
    }

    [HttpPost("pets")]
    public async Task<ActionResult<PetDto>> CreatePet(CreatePetRequest request, CancellationToken ct)
    {
        var orgId = GetOrgId();
        var userId = GetUserId();
        try
        {
            var pet = await _service.CreatePetAsync(orgId, userId, request, ct);
            return CreatedAtAction(null, pet);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("pets/{id:guid}")]
    public async Task<IActionResult> UpdatePet(Guid id, UpdatePetRequest request, CancellationToken ct)
    {
        var orgId = GetOrgId();
        var updated = await _service.UpdatePetAsync(id, orgId, request, ct);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("pets/{id:guid}")]
    public async Task<IActionResult> DeletePet(Guid id, CancellationToken ct)
    {
        var orgId = GetOrgId();
        var deleted = await _service.DeletePetAsync(id, orgId, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("pets/{petId:guid}/products")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetProducts(Guid petId, CancellationToken ct)
    {
        var orgId = GetOrgId();
        return Ok(await _service.GetPetProductsAsync(petId, orgId, ct));
    }

    [HttpPost("products")]
    public async Task<ActionResult<ProductDto>> CreateProduct(CreateProductRequest request, CancellationToken ct)
    {
        var orgId = GetOrgId();
        try
        {
            var product = await _service.CreateProductAsync(orgId, request, ct);
            return CreatedAtAction(null, product);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("products/{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id, CancellationToken ct)
    {
        var orgId = GetOrgId();
        var deleted = await _service.DeleteProductAsync(id, orgId, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("pets/{petId:guid}/adoptions")]
    public async Task<ActionResult<IReadOnlyList<AdoptionDto>>> GetAdoptions(Guid petId, CancellationToken ct)
    {
        var orgId = GetOrgId();
        return Ok(await _service.GetPetAdoptionsAsync(petId, orgId, ct));
    }

    [HttpPatch("adoptions/{adoptionId:guid}/status")]
    public async Task<IActionResult> RespondToAdoption(Guid adoptionId, UpdateAdoptionStatusBody body, CancellationToken ct)
    {
        var orgId = GetOrgId();
        var updated = await _service.RespondToAdoptionAsync(adoptionId, orgId, body.Status, body.Notes, ct);
        return updated ? NoContent() : NotFound();
    }

    private Guid GetOrgId()
    {
        var claim = User.FindFirstValue("organization_id");
        return Guid.Parse(claim!);
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }
}

public sealed record UpdateAdoptionStatusBody(AdoptionStatus Status, string? Notes);
