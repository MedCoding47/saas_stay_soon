using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize(Roles = "SuperAdmin")]
[Route("api/analytics")]
public sealed class AnalyticsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AnalyticsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("overview")]
    public async Task<ActionResult> GetOverview(CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var monthStart = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var totalUsers = await _db.Users.CountAsync(ct);
        var totalPets = await _db.Pets.CountAsync(ct);
        var totalBookings = await _db.Bookings.CountAsync(ct);
        var totalRevenue = await _db.Payments
            .Where(p => p.Status == "succeeded")
            .SumAsync(p => (decimal?)p.Amount, ct) ?? 0m;
        var activeListings = await _db.Pets.CountAsync(p => p.Status == Domain.Enums.AdoptionStatus.Available, ct);
        var adoptionsThisMonth = await _db.Adoptions
            .CountAsync(a => a.CompletedAt.HasValue && a.CompletedAt.Value >= new DateTimeOffset(monthStart), ct);
        var newUsersThisMonth = await _db.Users
            .CountAsync(u => u.CreatedAt >= new DateTimeOffset(monthStart), ct);
        var pendingBookings = await _db.Bookings
            .CountAsync(b => b.Status == BookingStatus.Pending, ct);

        return Ok(new
        {
            totalUsers,
            totalPets,
            totalBookings,
            totalRevenue,
            activeListings,
            adoptionsThisMonth,
            newUsersThisMonth,
            pendingBookings
        });
    }

    [HttpGet("bookings-over-time")]
    public async Task<ActionResult> GetBookingsOverTime(
        [FromQuery] string period = "30d",
        CancellationToken ct = default)
    {
        var days = period switch
        {
            "7d" => 7,
            "90d" => 90,
            _ => 30
        };

        var since = DateTime.UtcNow.Date.AddDays(-days);

        var data = await _db.Bookings
            .AsNoTracking()
            .Where(b => b.BookingDate >= new DateTimeOffset(since))
            .Select(b => new
            {
                b.BookingDate,
                Revenue = _db.Payments
                    .Where(p => p.BookingId == b.Id && p.Status == "succeeded")
                    .Sum(p => (decimal?)p.Amount) ?? 0m
            })
            .GroupBy(x => x.BookingDate.Date)
            .Select(g => new
            {
                date = g.Key,
                count = g.Count(),
                revenue = g.Sum(x => x.Revenue)
            })
            .OrderBy(x => x.date)
            .ToListAsync(ct);

        return Ok(data.Select(d => new
        {
            date = d.date.ToString("yyyy-MM-dd"),
            count = d.count,
            revenue = d.revenue
        }));
    }

    [HttpGet("pets-by-type")]
    public async Task<ActionResult> GetPetsByType(CancellationToken ct)
    {
        var data = await _db.Pets
            .AsNoTracking()
            .GroupBy(p => p.Type)
            .Select(g => new
            {
                type = g.Key,
                count = g.Count(),
                adopted = g.Count(p => p.Status == Domain.Enums.AdoptionStatus.Completed)
            })
            .OrderByDescending(x => x.count)
            .ToListAsync(ct);

        return Ok(data);
    }

    [HttpGet("top-shelters")]
    public async Task<ActionResult> GetTopShelters(CancellationToken ct)
    {
        var data = await _db.CompanyProfiles
            .AsNoTracking()
            .Select(c => new
            {
                id = c.Id,
                name = c.CompanyName,
                city = c.Location,
                bookingCount = c.Organization!.Pets
                    .SelectMany(p => p.Bookings)
                    .Count(),
                avgRating = c.Reviews.Any()
                    ? Math.Round(c.Reviews.Average(r => (double)r.Rating), 1)
                    : 0.0,
                petCount = c.Organization!.Pets.Count
            })
            .OrderByDescending(x => x.bookingCount)
            .Take(10)
            .ToListAsync(ct);

        return Ok(data);
    }

    [HttpGet("top-vets")]
    public async Task<ActionResult> GetTopVets(CancellationToken ct)
    {
        var data = await _db.VeterinaireProfiles
            .AsNoTracking()
            .Select(v => new
            {
                id = v.Id,
                name = v.ClinicName,
                city = v.Location,
                bookingCount = v.Bookings.Count,
                avgRating = v.Reviews.Any()
                    ? Math.Round(v.Reviews.Average(r => (double)r.Rating), 1)
                    : 0.0,
                petCount = 0
            })
            .OrderByDescending(x => x.bookingCount)
            .Take(10)
            .ToListAsync(ct);

        return Ok(data);
    }

    [HttpGet("recent-activity")]
    public async Task<ActionResult> GetRecentActivity(CancellationToken ct)
    {
        var activities = new List<ActivityDto>();

        var recentBookings = await _db.Bookings
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.VeterinaireProfile)
            .OrderByDescending(b => b.CreatedAt)
            .Take(10)
            .ToListAsync(ct);

        foreach (var b in recentBookings)
        {
            activities.Add(new ActivityDto(
                "booking",
                $"{b.User?.FullName ?? "Someone"} booked {b.VeterinaireProfile?.ClinicName ?? "a vet"}",
                b.CreatedAt
            ));
        }

        var recentReviews = await _db.Reviews
            .AsNoTracking()
            .Include(r => r.Author)
            .OrderByDescending(r => r.CreatedAt)
            .Take(10)
            .ToListAsync(ct);

        foreach (var r in recentReviews)
        {
            var target = r.VeterinaireProfileId.HasValue ? "vet" : "shelter";
            activities.Add(new ActivityDto(
                "review",
                $"New review ({r.Rating}★) for a {target}",
                r.CreatedAt
            ));
        }

        var recentAdoptions = await _db.Adoptions
            .AsNoTracking()
            .Include(a => a.Pet)
            .Include(a => a.Adopter)
            .Where(a => a.Status == Domain.Enums.AdoptionStatus.Completed)
            .OrderByDescending(a => a.UpdatedAt ?? a.CreatedAt)
            .Take(10)
            .ToListAsync(ct);

        foreach (var a in recentAdoptions)
        {
            activities.Add(new ActivityDto(
                "adoption",
                $"{a.Pet?.Name ?? "A pet"} was adopted by {a.Adopter?.FullName ?? "someone"}",
                a.UpdatedAt ?? a.CreatedAt
            ));
        }

        var recentUsers = await _db.Users
            .AsNoTracking()
            .OrderByDescending(u => u.CreatedAt)
            .Take(10)
            .ToListAsync(ct);

        foreach (var u in recentUsers)
        {
            activities.Add(new ActivityDto(
                "signup",
                $"{u.FullName} joined as {u.Role}",
                u.CreatedAt
            ));
        }

        return Ok(activities
            .OrderByDescending(a => a.Timestamp)
            .Take(20)
            .ToList());
    }
}

public sealed record ActivityDto(string Type, string Description, DateTimeOffset Timestamp);
