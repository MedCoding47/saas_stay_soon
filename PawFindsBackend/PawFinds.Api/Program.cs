using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PawFinds.Api.MultiTenancy;
using PawFinds.Domain.Entities;
using PawFinds.Application;
using PawFinds.Application.MultiTenancy;
using PawFinds.Infrastructure;
using PawFinds.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(configuration);

builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();
builder.Services.AddScoped<ITenantService, TenantService>();

var jwtIssuer = configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("JWT issuer is not configured.");
var jwtAudience = configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("JWT audience is not configured.");
var jwtSigningKey = configuration["Jwt:SigningKey"]
    ?? throw new InvalidOperationException("JWT signing key is not configured.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ValidateLifetime = true,
            RoleClaimType = "role",
            ClockSkew = TimeSpan.FromMinutes(2)
        };
    });

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        var origins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];

        policy
            .WithOrigins(origins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PawFinds API",
        Version = "v1",
        Description = "Production-ready ASP.NET Core Web API foundation for the PawFinds SaaS platform."
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter a JWT bearer token."
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            []
        }
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "PawFinds API v1");
    });
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

app.UseAuthentication();
app.UseMiddleware<TenantMiddleware>();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

using (var scope = app.Services.CreateScope())
{
    var serviceProvider = scope.ServiceProvider;
    var dbContext = serviceProvider.GetRequiredService<AppDbContext>();
    var passwordHasher = serviceProvider.GetRequiredService<IPasswordHasher<User>>();

    await dbContext.Database.MigrateAsync();
    await DbSeeder.SeedAsync(dbContext, passwordHasher);
}

app.Run();
