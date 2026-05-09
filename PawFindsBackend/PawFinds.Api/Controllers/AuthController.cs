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

    // ✅ LOGIN (already exists)
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

        return Ok(new LoginResponse { Token = token, TokenType = "Bearer", UserId = user.Id, OrganizationId = user.OrganizationId, Role = user.Role.ToString() });
    }

    // 🔴 REGISTER (NEW)
    [HttpPost("register")]
    public async Task<ActionResult<LoginResponse>> Register([FromBody] RegisterRequest request)
    {
        // Check if email exists (IMPORTANT: IgnoreQueryFilters)
        var exists = await _context.Users
            .IgnoreQueryFilters()
            .AnyAsync(u => u.Email == request.Email);

        if (exists)
            return BadRequest("Email already exists");

        // Create user
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            OrganizationId = request.OrganizationId,
            Role = RoleType.Applicant,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        // Hash password
        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // Generate token
        var token = _jwtService.GenerateToken(user);

        return Ok(new LoginResponse { Token = token, TokenType = "Bearer", UserId = user.Id, OrganizationId = user.OrganizationId, Role = user.Role.ToString() });
    }

    // 🔴 ME (NEW)
    // 🟢 DEBUG USERS (TEMP)
    [HttpGet("debug-users")]
    public async Task<IActionResult> DebugUsers()
    {
        var users = await _context.Users
            .IgnoreQueryFilters()
            .Select(u => new { u.Email, u.Role, u.OrganizationId })
            .ToListAsync();
        return Ok(users);
    }
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<object>> Me()
    {
        var userIdClaim = User.FindFirst("sub")?.Value 
                       ?? User.FindFirst("user_id")?.Value;

        if (userIdClaim == null)
            return Unauthorized();

        var userId = Guid.Parse(userIdClaim);

        var user = await _context.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            user.Role,
            user.OrganizationId
        });
    }
}