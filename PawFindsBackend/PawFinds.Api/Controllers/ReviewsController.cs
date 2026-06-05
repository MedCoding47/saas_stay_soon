using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Api.Controllers;

[ApiController]
[Route("api/reviews")]
public sealed class ReviewsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReviewsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult> CreateReview(CreateReviewRequest request, CancellationToken ct)
    {
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { error = "Rating must be between 1 and 5." });

        if (request.Comment?.Length > 500)
            return BadRequest(new { error = "Comment must not exceed 500 characters." });

        var userId = GetUserId();

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, ct);

        if (booking is null)
            return BadRequest(new { error = "Booking not found." });

        if (booking.UserId != userId)
            return Forbid();

        var payment = await _db.Payments
            .Where(p => p.BookingId == request.BookingId)
            .OrderByDescending(p => p.CreatedAt)
            .FirstOrDefaultAsync(ct);

        if (payment is null || payment.Status != "succeeded")
            return StatusCode(403, new { error = "Only completed, paid bookings can be reviewed." });

        var existing = await _db.Reviews.AnyAsync(r => r.AuthorId == userId && r.BookingId == request.BookingId, ct);
        if (existing)
            return Conflict(new { error = "You've already reviewed this booking." });

        var review = new Review
        {
            Id = Guid.NewGuid(),
            AuthorId = userId,
            VeterinaireProfileId = request.VeterinaireProfileId,
            CompanyProfileId = request.CompanyProfileId,
            BookingId = request.BookingId,
            Rating = request.Rating,
            Comment = request.Comment?.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(GetVetReviews), new { vetId = request.VeterinaireProfileId }, new ReviewResponse(
            review.Id, review.Rating, review.Comment, review.CreatedAt,
            (await _db.Users.Where(u => u.Id == userId).Select(u => u.FullName).FirstOrDefaultAsync(ct))!
        ));
    }

    [HttpGet("vet/{vetId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetVetReviews(Guid vetId, CancellationToken ct)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.VeterinaireProfileId == vetId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewItem(
                r.Id, r.Rating, r.Comment, r.CreatedAt,
                r.Author!.FullName))
            .ToListAsync(ct);

        var avg = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0.0;

        return Ok(new ReviewListResponse(avg, reviews.Count, reviews));
    }

    [HttpGet("company/{companyId:guid}")]
    [AllowAnonymous]
    public async Task<ActionResult> GetCompanyReviews(Guid companyId, CancellationToken ct)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.CompanyProfileId == companyId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewItem(
                r.Id, r.Rating, r.Comment, r.CreatedAt,
                r.Author!.FullName))
            .ToListAsync(ct);

        var avg = reviews.Count > 0 ? Math.Round(reviews.Average(r => r.Rating), 1) : 0.0;

        return Ok(new ReviewListResponse(avg, reviews.Count, reviews));
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteReview(Guid id, CancellationToken ct)
    {
        var review = await _db.Reviews.FirstOrDefaultAsync(r => r.Id == id, ct);
        if (review is null)
            return NotFound();

        var userId = GetUserId();
        var role = User.FindFirstValue(ClaimTypes.Role);

        if (review.AuthorId != userId && role != "SuperAdmin")
            return Forbid();

        _db.Reviews.Remove(review);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    [HttpGet("reviewable")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult> GetReviewableBookings(CancellationToken ct)
    {
        var userId = GetUserId();

        var succeededBookingIds = await _db.Payments
            .AsNoTracking()
            .Where(p => p.Status == "succeeded")
            .Select(p => p.BookingId)
            .ToListAsync(ct);

        var bookings = await _db.Bookings
            .AsNoTracking()
            .Where(b => b.UserId == userId)
            .Where(b => succeededBookingIds.Contains(b.Id))
            .Where(b => !_db.Reviews.Any(r => r.BookingId == b.Id))
            .Select(b => new ReviewableBooking(
                b.Id,
                b.VeterinaireProfileId,
                b.VeterinaireProfile!.User!.FullName,
                b.BookingDate))
            .ToListAsync(ct);

        return Ok(bookings);
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }
}

public sealed record CreateReviewRequest(
    Guid BookingId,
    Guid? VeterinaireProfileId,
    Guid? CompanyProfileId,
    int Rating,
    string? Comment);

public sealed record ReviewResponse(
    Guid Id, int Rating, string? Comment, DateTimeOffset CreatedAt, string AuthorName);

public sealed record ReviewItem(
    Guid Id, int Rating, string? Comment, DateTimeOffset CreatedAt, string AuthorName);

public sealed record ReviewListResponse(
    double AverageRating, int ReviewCount, List<ReviewItem> Reviews);

public sealed record ReviewableBooking(
    Guid BookingId, Guid VeterinaireProfileId, string VetName, DateTimeOffset BookingDate);
