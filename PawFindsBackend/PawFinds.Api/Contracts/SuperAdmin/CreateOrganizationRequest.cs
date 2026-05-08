namespace PawFinds.Api.Contracts.SuperAdmin;

public sealed record CreateOrganizationRequest(
    string Name,
    string Slug);
