using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PawFinds.Application.AdoptedPets;
using PawFinds.Application.Adoptions;
using PawFinds.Application.Auth;
using PawFinds.Application.Client;
using PawFinds.Application.Contact;
using PawFinds.Application.Enterprise;
using PawFinds.Application.Organizations;
using PawFinds.Application.Messages;
using PawFinds.Application.Notifications;
using PawFinds.Application.Pets;
using PawFinds.Application.SuperAdmin;
using PawFinds.Application.Veterinaire;
using PawFinds.Infrastructure.AdoptedPets;
using PawFinds.Infrastructure.Adoptions;
using PawFinds.Infrastructure.Auth;
using PawFinds.Infrastructure.Client;
using PawFinds.Infrastructure.Contact;
using PawFinds.Infrastructure.Conversations;
using PawFinds.Infrastructure.Enterprise;
using PawFinds.Infrastructure.Messages;
using PawFinds.Infrastructure.Notifications;
using PawFinds.Infrastructure.Persistence;
using PawFinds.Infrastructure.Pets;
using PawFinds.Infrastructure.SuperAdmin;
using PawFinds.Infrastructure.Organizations;
using PawFinds.Infrastructure.Veterinaire;

namespace PawFinds.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing.");

        services.AddDbContext<AppDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        var jwtSection = configuration.GetSection("Jwt");
        services.Configure<JwtOptions>(options =>
        {
            options.Issuer = jwtSection["Issuer"] ?? string.Empty;
            options.Audience = jwtSection["Audience"] ?? string.Empty;
            options.SigningKey = jwtSection["SigningKey"] ?? string.Empty;

            if (int.TryParse(jwtSection["AccessTokenMinutes"], out var accessTokenMinutes))
            {
                options.AccessTokenMinutes = accessTokenMinutes;
            }
        });
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPetService, PetService>();
        services.AddScoped<IAdoptionService, AdoptionService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ISuperAdminService, SuperAdminService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<IConversationService, ConversationService>();
        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IEnterpriseService, EnterpriseService>();
        services.AddScoped<IClientService, ClientService>();
        services.AddScoped<IVeterinaireService, VeterinaireService>();
        services.AddScoped<IAdoptedPetsService, AdoptedPetsService>();
        services.AddScoped<IOrganizationService, OrganizationService>();

        return services;
    }
}
