using Microsoft.EntityFrameworkCore;
using PawFinds.Application.Veterinaire;
using PawFinds.Domain.Entities;
using PawFinds.Infrastructure.Persistence;

namespace PawFinds.Infrastructure.Veterinaire;

public sealed class VeterinaireService : IVeterinaireService
{
    private readonly AppDbContext _db;

    public VeterinaireService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<VeterinaireProfileDto> GetProfileAsync(Guid userId, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);

        if (profile is null)
            throw new InvalidOperationException("Veterinaire profile not found.");

        return ToProfileDto(profile);
    }

    public async Task<VeterinaireProfileDto> UpdateProfileAsync(Guid userId, UpdateVeterinaireProfileRequest request, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);

        if (profile is null)
            throw new InvalidOperationException("Veterinaire profile not found.");

        profile.ClinicName = request.ClinicName;
        profile.Location = request.Location;
        profile.Phone = request.Phone;
        profile.Description = request.Description;
        profile.Latitude = request.Latitude;
        profile.Longitude = request.Longitude;
        profile.IsAvailable = request.IsAvailable;
        profile.GoogleMapsUrl = request.GoogleMapsUrl;
        profile.Formation = request.Formation;
        profile.UpdatedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync(ct);
        return ToProfileDto(profile);
    }

    public async Task<IReadOnlyList<AdviceDto>> GetAdviceAsync(Guid userId, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);
        if (profile is null) return [];

        return await _db.Advice
            .AsNoTracking()
            .Where(a => a.VeterinaireProfileId == profile.Id)
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new AdviceDto(a.Id, a.Title, a.Content, a.CreatedAt))
            .ToListAsync(ct);
    }

    public async Task<AdviceDto> CreateAdviceAsync(Guid userId, CreateAdviceRequest request, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);
        if (profile is null)
            throw new InvalidOperationException("Veterinaire profile not found.");

        var advice = new Advice
        {
            Id = Guid.NewGuid(),
            VeterinaireProfileId = profile.Id,
            Title = request.Title.Trim(),
            Content = request.Content.Trim()
        };

        _db.Advice.Add(advice);
        await _db.SaveChangesAsync(ct);

        return new AdviceDto(advice.Id, advice.Title, advice.Content, advice.CreatedAt);
    }

    public async Task<bool> DeleteAdviceAsync(Guid adviceId, Guid userId, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);
        if (profile is null) return false;

        var advice = await _db.Advice
            .FirstOrDefaultAsync(a => a.Id == adviceId && a.VeterinaireProfileId == profile.Id, ct);
        if (advice is null) return false;

        _db.Advice.Remove(advice);
        await _db.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<BookingDto>> GetBookingsAsync(Guid userId, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .AsNoTracking()
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);
        if (profile is null) return [];

        return await _db.Bookings
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.Pet)
            .Where(b => b.VeterinaireProfileId == profile.Id)
            .OrderByDescending(b => b.BookingDate)
            .Select(b => new BookingDto(
                b.Id, b.UserId, b.User!.FullName, b.PetId, b.Pet!.Name,
                b.BookingDate, b.Status.ToString(), b.Notes))
            .ToListAsync(ct);
    }

    public async Task<bool> UpdateBookingStatusAsync(Guid bookingId, Guid userId, string status, CancellationToken ct)
    {
        var profile = await _db.VeterinaireProfiles
            .FirstOrDefaultAsync(vp => vp.UserId == userId, ct);
        if (profile is null) return false;

        var booking = await _db.Bookings
            .FirstOrDefaultAsync(b => b.Id == bookingId && b.VeterinaireProfileId == profile.Id, ct);
        if (booking is null) return false;

        if (Enum.TryParse<BookingStatus>(status, true, out var parsed))
        {
            booking.Status = parsed;
            booking.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync(ct);
            return true;
        }

        return false;
    }

    private static VeterinaireProfileDto ToProfileDto(VeterinaireProfile vp) => new(
        vp.Id, vp.ClinicName, vp.Location, vp.Phone, vp.Description,
        vp.Latitude, vp.Longitude, vp.IsAvailable,
        vp.GoogleMapsUrl, vp.Formation);
}
