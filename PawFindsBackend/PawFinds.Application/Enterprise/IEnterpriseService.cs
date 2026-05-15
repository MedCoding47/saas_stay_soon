using PawFinds.Application.Common;
using PawFinds.Application.Pets;
using PawFinds.Domain.Enums;

namespace PawFinds.Application.Enterprise;

public interface IEnterpriseService
{
    Task<CompanyProfileDto> GetCompanyProfileAsync(Guid organizationId, CancellationToken ct);
    Task<CompanyProfileDto> UpdateCompanyProfileAsync(Guid organizationId, UpdateCompanyProfileRequest request, CancellationToken ct);
    Task<IReadOnlyList<PetDto>> GetEnterprisePetsAsync(Guid organizationId, CancellationToken ct);
    Task<PetDto> CreatePetAsync(Guid organizationId, Guid ownerId, CreatePetRequest request, CancellationToken ct);
    Task<bool> UpdatePetAsync(Guid petId, Guid organizationId, UpdatePetRequest request, CancellationToken ct);
    Task<bool> DeletePetAsync(Guid petId, Guid organizationId, CancellationToken ct);
    Task<IReadOnlyList<ProductDto>> GetPetProductsAsync(Guid petId, Guid organizationId, CancellationToken ct);
    Task<ProductDto> CreateProductAsync(Guid organizationId, CreateProductRequest request, CancellationToken ct);
    Task<bool> DeleteProductAsync(Guid productId, Guid organizationId, CancellationToken ct);
    Task<IReadOnlyList<AdoptionDto>> GetPetAdoptionsAsync(Guid petId, Guid organizationId, CancellationToken ct);
    Task<bool> RespondToAdoptionAsync(Guid adoptionId, Guid organizationId, AdoptionStatus newStatus, string? notes, CancellationToken ct);
    Task<IReadOnlyList<ProductDto>> GetCatalogAsync(Guid organizationId, CancellationToken ct);
    Task<ProductDto> CreateCatalogProductAsync(Guid organizationId, CreateProductRequest request, CancellationToken ct);
    Task<bool> DeleteCatalogProductAsync(Guid productId, Guid organizationId, CancellationToken ct);
    Task SetPetProductsAsync(Guid petId, Guid organizationId, List<Guid> productIds, CancellationToken ct);
}

public sealed record CompanyProfileDto(
    Guid Id, Guid OrganizationId, string CompanyName, string? Description,
    string? LogoUrl, string Location, string? Phone, string? Email,
    string? Website, double? Latitude, double? Longitude);

public sealed record UpdateCompanyProfileRequest(
    string CompanyName, string? Description, string? LogoUrl,
    string Location, string? Phone, string? Email, string? Website,
    double? Latitude, double? Longitude);

public sealed record CreateProductRequest(
    string Name, string? Description, decimal Price, string? ImageUrl, Guid? PetId = null);

public sealed record ProductDto(
    Guid Id, Guid? PetId, string Name, string? Description, decimal Price, string? ImageUrl, DateTimeOffset CreatedAt);

public sealed record AdoptionDto(
    Guid Id, Guid PetId, Guid AdopterId, string? AdopterName, string? PetName,
    AdoptionStatus Status, string? ApplicationMessage, string? AdminNotes,
    DateTimeOffset? CompletedAt, DateTimeOffset CreatedAt,
    string? AdopterProfilePictureUrl);


