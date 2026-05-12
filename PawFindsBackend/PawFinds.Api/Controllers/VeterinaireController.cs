using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Application.Veterinaire;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "Veterinaire")]
[Route("api/veterinaire")]
public sealed class VeterinaireController : ControllerBase
{
    private readonly IVeterinaireService _service;

    public VeterinaireController(IVeterinaireService service)
    {
        _service = service;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<VeterinaireProfileDto>> GetProfile(CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.GetProfileAsync(userId, ct));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<VeterinaireProfileDto>> UpdateProfile(UpdateVeterinaireProfileRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.UpdateProfileAsync(userId, request, ct));
    }

    [HttpGet("advice")]
    public async Task<ActionResult<IReadOnlyList<AdviceDto>>> GetAdvice(CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.GetAdviceAsync(userId, ct));
    }

    [HttpPost("advice")]
    public async Task<ActionResult<AdviceDto>> CreateAdvice(CreateAdviceRequest request, CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.CreateAdviceAsync(userId, request, ct));
    }

    [HttpDelete("advice/{id:guid}")]
    public async Task<IActionResult> DeleteAdvice(Guid id, CancellationToken ct)
    {
        var userId = GetUserId();
        var deleted = await _service.DeleteAdviceAsync(id, userId, ct);
        return deleted ? NoContent() : NotFound();
    }

    [HttpGet("bookings")]
    public async Task<ActionResult<IReadOnlyList<BookingDto>>> GetBookings(CancellationToken ct)
    {
        var userId = GetUserId();
        return Ok(await _service.GetBookingsAsync(userId, ct));
    }

    [HttpPatch("bookings/{id:guid}/status")]
    public async Task<IActionResult> UpdateBookingStatus(Guid id, UpdateBookingStatusBody body, CancellationToken ct)
    {
        var userId = GetUserId();
        var updated = await _service.UpdateBookingStatusAsync(id, userId, body.Status, ct);
        return updated ? NoContent() : NotFound();
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }
}

public sealed record UpdateBookingStatusBody(string Status);
