using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PawFinds.Api.Contracts.Adoptions;
using PawFinds.Application.Adoptions;
using PawFinds.Application.Common;
using PawFinds.Infrastructure.Adoptions;

namespace PawFinds.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/adoptions")]
public sealed class AdoptionsController : ControllerBase
{
    private readonly IAdoptionService _adoptionService;

    public AdoptionsController(IAdoptionService adoptionService)
    {
        _adoptionService = adoptionService;
    }

    [HttpGet("mine")]
    public async Task<ActionResult<PagedResult<AdoptionDto>>> GetMyAdoptions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken cancellationToken = default)
    {
        if (!TryGetCurrentUserId(out var adopterId))
        {
            return Unauthorized(new { message = "User context is missing." });
        }

        var request = new GetAdoptionsRequest(
            AdopterId: adopterId,
            Page: page,
            PageSize: pageSize);

        var pagedResult = await _adoptionService.GetAdoptionsPagedAsync(
            request,
            cancellationToken);

        return Ok(pagedResult);
    }

    [HttpPost("apply")]
    [Authorize(Roles = "Adopter,Applicant")]
    public async Task<ActionResult<AdoptionDto>> Apply(
        ApplyAdoptionRequest request,
        CancellationToken cancellationToken)
    {
        if (!TryGetCurrentUserId(out var adopterId))
        {
            return Unauthorized(new { message = "User context is missing." });
        }

        var createRequest = new CreateAdoptionRequest
        {
            PetId = request.PetId,
            AdopterId = adopterId,
            ApplicationMessage = request.ApplicationMessage
        };

        try
        {
            var adoption = await _adoptionService.CreateApplicationAsync(
                createRequest,
                cancellationToken);

            return CreatedAtAction(nameof(GetAdoptions), new { id = adoption.Id }, adoption);
        }
        catch (AdoptionWorkflowException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<PagedResult<AdoptionDto>>> GetAdoptions(
        [FromQuery] GetAdoptionsRequest request,
        CancellationToken cancellationToken)
    {
        var pagedResult = await _adoptionService.GetAdoptionsPagedAsync(
            request,
            cancellationToken);

        return Ok(pagedResult);
    }

    [HttpPatch("{id:guid}/status")]
    [Authorize(Roles = "Admin,Staff")]
    public async Task<ActionResult<AdoptionDto>> UpdateStatus(
        Guid id,
        UpdateAdoptionStatusRequest request,
        CancellationToken cancellationToken)
    {
        var transitionRequest = new TransitionAdoptionRequest
        {
            Status = request.Status,
            AdminNotes = request.AdminNotes
        };

        try
        {
            var adoption = await _adoptionService.TransitionAsync(
                id,
                transitionRequest,
                cancellationToken);

            return adoption is null ? NotFound() : Ok(adoption);
        }
        catch (AdoptionWorkflowException exception)
        {
            return BadRequest(new { message = exception.Message });
        }
    }

    private bool TryGetCurrentUserId(out Guid userId)
    {
        var userIdClaim = User.FindFirstValue("user_id");

        return Guid.TryParse(userIdClaim, out userId);
    }
}
