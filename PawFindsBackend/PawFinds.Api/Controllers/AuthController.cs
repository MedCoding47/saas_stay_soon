using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Security.Claims;
using PawFinds.Infrastructure.Persistence;
using PawFinds.Domain.Entities;
using PawFinds.Domain.Enums;
using PawFinds.Application.Auth;
using PawFinds.Api.Contracts.Auth;

namespace PawFinds.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IJwtService _jwtService;
    private readonly IPasswordHasher<User> _passwordHasher;

    public AuthController(
        AppDbContext context,
        IJwtService jwtService,
        IPasswordHasher<User> passwordHasher)
    {
        _context = context;
        _jwtService = jwtService;
        _passwordHasher = passwordHasher;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request)
    {
        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            return Unauthorized("Invalid credentials");

        var result = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password);

        if (result == PasswordVerificationResult.Failed)
            return Unauthorized("Invalid credentials");

        var token = _jwtService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            TokenType = "Bearer",
            UserId = user.Id,
            OrganizationId = user.OrganizationId,
            Role = user.Role.ToString(),
            FullName = user.FullName,
            ProfilePictureUrl = user.ProfilePictureUrl
        });
    }

    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        var exists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.Email);

        if (exists)
            return BadRequest("Email already exists");

        var role = RoleType.Client;

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.PhoneNumber,
            Address = request.Address,
            OrganizationId = request.OrganizationId,
            Role = role,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var token = _jwtService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            TokenType = "Bearer",
            UserId = user.Id,
            OrganizationId = user.OrganizationId,
            Role = user.Role.ToString(),
            FullName = user.FullName,
            ProfilePictureUrl = user.ProfilePictureUrl
        });
    }

    [HttpPost("register-org")]
    public async Task<ActionResult<LoginResponse>> RegisterOrg([FromBody] RegisterOrgRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email)
            || string.IsNullOrWhiteSpace(request.Password)
            || string.IsNullOrWhiteSpace(request.FullName)
            || string.IsNullOrWhiteSpace(request.OrgName)
            || string.IsNullOrWhiteSpace(request.OrgSlug))
        {
            return BadRequest("Email, password, full name, organization name and slug are required.");
        }

        var email = request.Email.Trim();
        var orgSlug = request.OrgSlug.Trim().ToLowerInvariant();

        if (await _context.Users.IgnoreQueryFilters().AnyAsync(u => u.Email == email))
            return BadRequest("Email already exists");

        if (await _context.Organizations.IgnoreQueryFilters().AnyAsync(o => o.Slug == orgSlug))
            return BadRequest("Organization slug already exists");

        var org = new Organization
        {
            Name = request.OrgName.Trim(),
            Slug = orgSlug,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _context.Organizations.Add(org);
        await _context.SaveChangesAsync();

        var user = new User
        {
            Id = Guid.NewGuid(),
            OrganizationId = org.Id,
            Email = email,
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber,
            Role = RoleType.Enterprise,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);
        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        var profile = await _context.CompanyProfiles
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(cp => cp.OrganizationId == org.Id);

        if (profile is null)
        {
            profile = new CompanyProfile
            {
                OrganizationId = org.Id,
                CompanyName = request.OrgName.Trim(),
                Location = request.Location ?? "",
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };
            _context.CompanyProfiles.Add(profile);
            await _context.SaveChangesAsync();
        }

        var token = _jwtService.GenerateToken(user);

        return Ok(new LoginResponse
        {
            Token = token,
            TokenType = "Bearer",
            UserId = user.Id,
            OrganizationId = user.OrganizationId,
            Role = user.Role.ToString(),
            FullName = user.FullName,
            ProfilePictureUrl = user.ProfilePictureUrl
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<MeResponse>> Me()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("user_id");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        return Ok(new MeResponse(
            user.Id,
            user.Email,
            user.FullName,
            user.Role.ToString(),
            user.OrganizationId,
            user.PhoneNumber,
            user.Address,
            user.About,
            user.ProfilePictureUrl));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("user_id");

        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(request.FullName))
            user.FullName = request.FullName;

        if (!string.IsNullOrWhiteSpace(request.PhoneNumber))
            user.PhoneNumber = request.PhoneNumber;

        if (!string.IsNullOrWhiteSpace(request.Address))
            user.Address = request.Address;

        if (request.About != null)
            user.About = request.About;

        if (request.ProfilePictureUrl != null)
            user.ProfilePictureUrl = request.ProfilePictureUrl;

        user.UpdatedAt = DateTimeOffset.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new MeResponse(
            user.Id, user.Email, user.FullName, user.Role.ToString(),
            user.OrganizationId, user.PhoneNumber, user.Address, user.About, user.ProfilePictureUrl));
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
                       ?? User.FindFirstValue("user_id");
        return Guid.TryParse(userIdClaim, out userId);
    }
}
