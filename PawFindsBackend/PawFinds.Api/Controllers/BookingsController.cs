using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "Client")]
[Route("api/bookings")]
public sealed class BookingsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BookingsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBooking(
        CreateBookingRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();

        var profile = await _db.VeterinaireProfiles
            .FirstOrDefaultAsync(vp => vp.Id == request.VeterinaireProfileId, ct);

        if (profile is null)
            return BadRequest(new { error = "Veterinaire profile not found." });

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            VeterinaireProfileId = request.VeterinaireProfileId,
            PetId = request.PetId,
            BookingDate = request.BookingDate,
            Status = BookingStatus.Pending,
            Notes = request.Notes?.Trim()
        };

        _db.Bookings.Add(booking);
        await _db.SaveChangesAsync(ct);

        return Ok(new BookingResponse(booking.Id));
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }
}

public sealed record CreateBookingRequest(
    Guid VeterinaireProfileId,
    Guid? PetId,
    DateTimeOffset BookingDate,
    string? Notes);

public sealed record BookingResponse(Guid Id);
