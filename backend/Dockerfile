# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:9.0-bookworm-slim AS build
WORKDIR /src

# Restore (leverage layer caching by copying csproj/sln first).
COPY ISTQBuddy.sln Directory.Build.props global.json ./
COPY src/ISTQBuddy.Domain/ISTQBuddy.Domain.csproj src/ISTQBuddy.Domain/
COPY src/ISTQBuddy.Application/ISTQBuddy.Application.csproj src/ISTQBuddy.Application/
COPY src/ISTQBuddy.Infrastructure/ISTQBuddy.Infrastructure.csproj src/ISTQBuddy.Infrastructure/
COPY src/ISTQBuddy.Api/ISTQBuddy.Api.csproj src/ISTQBuddy.Api/
RUN dotnet restore src/ISTQBuddy.Api/ISTQBuddy.Api.csproj

# Copy the rest and publish.
COPY . .
RUN dotnet publish src/ISTQBuddy.Api/ISTQBuddy.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:9.0-bookworm-slim AS runtime
WORKDIR /app
COPY --from=build /app/publish ./

ENV ASPNETCORE_URLS=http://+:8080
# Memory-friendly GC for constrained hosts (e.g. Render 512MB).
ENV DOTNET_gcServer=0
EXPOSE 8080

ENTRYPOINT ["dotnet", "ISTQBuddy.Api.dll"]
