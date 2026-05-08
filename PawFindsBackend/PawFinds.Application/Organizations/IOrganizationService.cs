using PawFinds.Domain.Enums;

namespace PawFinds.Application.Organizations;

public interface IOrganizationService
{
    Task<(Guid userId, string tempPassword)> InviteUserAsync(
        string email,
        string fullName,
        RoleType role,
        Guid organizationId,
        CancellationToken cancellationToken);
}
