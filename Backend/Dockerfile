# ── Build stage ──
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar archivos de proyecto primero (cachear restore)
COPY TaskService.Domain/TaskService.Domain.csproj TaskService.Domain/
COPY TaskService.Application/TaskService.Application.csproj TaskService.Application/
COPY TaskService.Infrastructure/TaskService.Infrastructure.csproj TaskService.Infrastructure/
COPY TaskService.Api/TaskService.Api.csproj TaskService.Api/
COPY TaskService.sln .
RUN dotnet restore TaskService.sln

# Copiar todo el código fuente
COPY . .
RUN dotnet publish TaskService.Api/TaskService.Api.csproj -c Release -o /app/publish --no-restore

# ── Runtime stage ──
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

# Crear usuario no-root para seguridad
RUN groupadd -r appuser && useradd -r -g appuser -s /bin/false appuser

COPY --from=build /app/publish .

# Crear directorio de logs
RUN mkdir -p /app/logs && chown -R appuser:appuser /app

USER appuser

ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "TaskService.Api.dll"]
