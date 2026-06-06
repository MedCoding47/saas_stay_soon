using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;
using Stripe;

namespace PawFinds.Api.Controllers;

[ApiController]
[Route("api/payments")]
public sealed class PaymentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public PaymentsController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost("create-intent")]
    [Authorize(Roles = "Client")]
    public async Task<ActionResult<CreateIntentResponse>> CreateIntent(
        CreateIntentRequest request,
        CancellationToken ct)
    {
        var userId = GetUserId();

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == request.BookingId, ct);

        if (booking is null)
            return BadRequest(new { error = "Booking not found." });

        StripeConfiguration.ApiKey = _config["Stripe:SecretKey"];

        var options = new PaymentIntentCreateOptions
        {
            Amount = (long)(request.Amount * 100),
            Currency = request.Currency ?? "mad",
            Metadata = new Dictionary<string, string>
            {
                { "booking_id", request.BookingId.ToString() },
                { "user_id", userId.ToString() }
            }
        };

        var service = new PaymentIntentService();
        var intent = await service.CreateAsync(options, cancellationToken: ct);

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            BookingId = request.BookingId,
            UserId = userId,
            Amount = request.Amount,
            Currency = request.Currency ?? "mad",
            StripePaymentIntentId = intent.Id,
            Status = "pending"
        };

        _db.Payments.Add(payment);
        await _db.SaveChangesAsync(ct);

        return Ok(new CreateIntentResponse(intent.ClientSecret, intent.Id));
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    public async Task<IActionResult> Webhook(CancellationToken ct)
    {
        HttpContext.Request.EnableBuffering();
        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync(ct);
        var webhookSecret = _config["Stripe:WebhookSecret"];

        try
        {
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                webhookSecret);

            if (stripeEvent.Type == "payment_intent.succeeded")
            {
                var intent = stripeEvent.Data.Object as PaymentIntent;
                if (intent is not null)
                {
                    await UpdatePaymentStatus(intent.Id, "succeeded", BookingStatus.Confirmed, ct);
                }
            }
            else if (stripeEvent.Type == "payment_intent.payment_failed")
            {
                var intent = stripeEvent.Data.Object as PaymentIntent;
                if (intent is not null)
                {
                    await UpdatePaymentStatus(intent.Id, "failed", null, ct);
                }
            }

            return Ok();
        }
        catch (StripeException)
        {
            return BadRequest();
        }
    }

    [HttpGet("booking/{bookingId:guid}")]
    [Authorize]
    public async Task<ActionResult<PaymentDto>> GetPaymentByBooking(
        Guid bookingId,
        CancellationToken ct)
    {
        var payment = await _db.Payments
            .AsNoTracking()
            .Where(p => p.BookingId == bookingId)
            .OrderByDescending(p => p.CreatedAt)
            .Select(p => new PaymentDto(
                p.Id,
                p.BookingId,
                p.Amount,
                p.Currency,
                p.Status,
                p.StripePaymentIntentId))
            .FirstOrDefaultAsync(ct);

        if (payment is null)
            return NotFound();

        return Ok(payment);
    }

    private async Task UpdatePaymentStatus(
        string stripePaymentIntentId,
        string paymentStatus,
        BookingStatus? bookingStatus,
        CancellationToken ct)
    {
        var payment = await _db.Payments
            .FirstOrDefaultAsync(p => p.StripePaymentIntentId == stripePaymentIntentId, ct);

        if (payment is null) return;

        payment.Status = paymentStatus;
        payment.UpdatedAt = DateTimeOffset.UtcNow;

        if (bookingStatus.HasValue)
        {
            var booking = await _db.Bookings
                .FirstOrDefaultAsync(b => b.Id == payment.BookingId, ct);

            if (booking is not null)
            {
                booking.Status = bookingStatus.Value;
                booking.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        await _db.SaveChangesAsync(ct);
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                 ?? User.FindFirstValue("user_id");
        return Guid.Parse(claim!);
    }
}

public sealed record CreateIntentRequest(Guid BookingId, decimal Amount, string? Currency);

public sealed record CreateIntentResponse(string ClientSecret, string PaymentIntentId);

public sealed record PaymentDto(
    Guid Id,
    Guid BookingId,
    decimal Amount,
    string Currency,
    string Status,
    string StripePaymentIntentId);
