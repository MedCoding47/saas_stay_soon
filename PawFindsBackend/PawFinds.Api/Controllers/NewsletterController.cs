using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Api.Controllers;

[ApiController]
[Route("api/newsletter")]
public sealed class NewsletterController : ControllerBase
{
    private readonly AppDbContext _db;

    public NewsletterController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("subscribe")]
    [AllowAnonymous]
    public async Task<IActionResult> Subscribe(SubscribeRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || !new EmailAddressAttribute().IsValid(request.Email))
            return BadRequest(new { message = "Invalid email address." });

        var existing = await _db.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Email == request.Email.Trim().ToLower(), ct);

        if (existing is not null)
        {
            if (existing.IsActive)
                return Conflict(new { message = "Already subscribed" });

            existing.IsActive = true;
            existing.Name = request.Name?.Trim();
            existing.SubscribedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync(ct);
            return Ok(new { message = "Subscribed successfully" });
        }

        _db.NewsletterSubscribers.Add(new NewsletterSubscriber
        {
            Id = Guid.NewGuid(),
            Email = request.Email.Trim().ToLower(),
            Name = request.Name?.Trim(),
            SubscribedAt = DateTime.UtcNow,
            IsActive = true
        });

        await _db.SaveChangesAsync(ct);
        return Created(string.Empty, new { message = "Subscribed successfully" });
    }

    [HttpPost("unsubscribe")]
    [AllowAnonymous]
    public async Task<IActionResult> Unsubscribe(UnsubscribeRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required." });

        var subscriber = await _db.NewsletterSubscribers
            .FirstOrDefaultAsync(s => s.Email == request.Email.Trim().ToLower(), ct);

        if (subscriber is null)
            return NotFound(new { message = "Subscriber not found." });

        subscriber.IsActive = false;
        await _db.SaveChangesAsync(ct);

        return Ok(new { message = "Unsubscribed successfully" });
    }

    [HttpGet("subscribers")]
    [Authorize(Roles = "SuperAdmin")]
    public async Task<ActionResult<IReadOnlyList<SubscriberDto>>> GetSubscribers(CancellationToken ct)
    {
        var subscribers = await _db.NewsletterSubscribers
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderByDescending(s => s.SubscribedAt)
            .Select(s => new SubscriberDto(s.Email, s.Name, s.SubscribedAt))
            .ToListAsync(ct);

        return Ok(subscribers);
    }
}

public sealed record SubscribeRequest(string Email, string? Name);

public sealed record UnsubscribeRequest(string Email);

public sealed record SubscriberDto(string Email, string? Name, DateTime SubscribedAt);
