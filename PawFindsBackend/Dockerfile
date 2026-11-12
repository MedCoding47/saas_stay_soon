# build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY PawFinds.sln ./
COPY PawFinds.Api/PawFinds.Api.csproj PawFinds.Api/
COPY PawFinds.Application/PawFinds.Application.csproj PawFinds.Application/
COPY PawFinds.Domain/PawFinds.Domain.csproj PawFinds.Domain/
COPY PawFinds.Infrastructure/PawFinds.Infrastructure.csproj PawFinds.Infrastructure/

RUN dotnet restore PawFinds.Api/PawFinds.Api.csproj

COPY PawFinds.Api/ PawFinds.Api/
COPY PawFinds.Application/ PawFinds.Application/
COPY PawFinds.Domain/ PawFinds.Domain/
COPY PawFinds.Infrastructure/ PawFinds.Infrastructure/

RUN dotnet publish PawFinds.Api/PawFinds.Api.csproj -c Release -o /app/publish --no-restore

# runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "PawFinds.Api.dll"]