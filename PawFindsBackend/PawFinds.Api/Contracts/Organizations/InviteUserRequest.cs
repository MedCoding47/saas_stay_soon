using PawFinds.Domain.Enums;

namespace PawFinds.Api.Contracts.Organizations;

public sealed record InviteUserRequest(
    string Email,
    string FullName,
    RoleType Role);
