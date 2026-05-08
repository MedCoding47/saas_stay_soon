using PawFinds.Domain.Entities;

namespace PawFinds.Application.Auth;

public interface IJwtService
{
    string GenerateToken(User user);
}
