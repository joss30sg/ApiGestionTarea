using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;

namespace TaskService.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
[EnableRateLimiting("auth-strict")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    // Almacén en memoria de refresh tokens (en producción usar BD)
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, RefreshTokenInfo> _refreshTokens = new();

    // Almacén en memoria de usuarios registrados (en producción usar BD)
    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, RegisteredUser> _registeredUsers = new();

    public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// REGISTER - Registrar nuevo usuario
    /// </summary>
    /// <remarks>
    /// Crea una cuenta de usuario con rol "User". El nombre de usuario "admin" está reservado.
    /// Requisitos: usuario (3-30 caracteres), contraseña (mínimo 8 caracteres).
    /// La contraseña se almacena con hash PBKDF2-SHA256 (100K iteraciones).
    /// </remarks>
    [HttpPost("register")]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "Usuario y contraseña son requeridos", code = "MISSING_FIELDS" });

        if (request.Username.Length < 3 || request.Username.Length > 30)
            return BadRequest(new { error = "El usuario debe tener entre 3 y 30 caracteres", code = "INVALID_USERNAME" });

        if (request.Password.Length < 8)
            return BadRequest(new { error = "La contraseña debe tener al menos 8 caracteres", code = "WEAK_PASSWORD" });

        if (!System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[A-Z]") ||
            !System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[a-z]") ||
            !System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[0-9]") ||
            !System.Text.RegularExpressions.Regex.IsMatch(request.Password, @"[!@#$%^&*()_+\-=]"))
            return BadRequest(new { error = "La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales", code = "WEAK_PASSWORD" });

        // No permitir registrar con nombres de usuarios del sistema
        var adminUser = _configuration["Auth:Username"] ?? "admin";
        if (request.Username.Equals(adminUser, StringComparison.OrdinalIgnoreCase))
            return Conflict(new { error = "El nombre de usuario no está disponible", code = "USERNAME_TAKEN" });

        var userKey = request.Username.ToLowerInvariant();
        var newUser = new RegisteredUser
        {
            Username = request.Username,
            PasswordHash = HashPassword(request.Password),
            FullName = request.FullName?.Trim() ?? request.Username,
            CreatedAt = DateTime.UtcNow
        };

        if (!_registeredUsers.TryAdd(userKey, newUser))
            return Conflict(new { error = "El nombre de usuario ya está registrado", code = "USERNAME_TAKEN" });

        _logger.LogInformation("Usuario registrado: {Username}", request.Username);
        return StatusCode(201, new { message = "Usuario registrado exitosamente" });
    }

    /// <summary>
    /// LOGIN - Obtener JWT y Refresh Token
    /// </summary>
    /// <remarks>
    /// Administradores: usan credenciales preconfiguradas (ver README).
    /// Usuarios normales: deben registrarse primero con POST /api/auth/register.
    /// </remarks>
    [HttpPost("login")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Credenciales de admin
        var adminUser = _configuration["Auth:Username"] 
            ?? throw new InvalidOperationException("Auth:Username no configurado. Defina la variable de entorno Auth__Username.");
        var adminPassword = _configuration["Auth:Password"] 
            ?? throw new InvalidOperationException("Auth:Password no configurado. Defina la variable de entorno Auth__Password.");

        if (request.Username.Equals(adminUser, StringComparison.OrdinalIgnoreCase) && request.Password == adminPassword)
        {
            var tokens = GenerateTokens(adminUser, "Admin");
            _logger.LogInformation("Login exitoso (Admin): {Username}", request.Username);
            return Ok(tokens);
        }

        // Verificar usuarios registrados
        var userKey = request.Username.ToLowerInvariant();
        if (_registeredUsers.TryGetValue(userKey, out var registered) &&
            VerifyPassword(request.Password, registered.PasswordHash))
        {
            var tokens = GenerateTokens(registered.Username, "User");
            _logger.LogInformation("Login exitoso (Registrado): {Username}", registered.Username);
            return Ok(tokens);
        }

        _logger.LogWarning("Intento de login fallido para usuario: {Username} desde {IP}",
            request.Username, HttpContext.Connection.RemoteIpAddress);
        return Unauthorized(new { error = "Credenciales inválidas", code = "INVALID_CREDENTIALS" });
    }

    /// <summary>
    /// REFRESH - Renovar JWT con Refresh Token
    /// </summary>
    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Refresh([FromBody] RefreshRequest request)
    {
        if (string.IsNullOrEmpty(request.RefreshToken))
            return Unauthorized(new { error = "Refresh token requerido", code = "MISSING_REFRESH_TOKEN" });

        if (!_refreshTokens.TryRemove(request.RefreshToken, out var tokenInfo))
        {
            _logger.LogWarning("Refresh token inválido utilizado");
            return Unauthorized(new { error = "Refresh token inválido", code = "INVALID_REFRESH_TOKEN" });
        }

        if (tokenInfo.ExpiresAt < DateTime.UtcNow)
        {
            _logger.LogWarning("Refresh token expirado para usuario: {Username}", tokenInfo.Username);
            return Unauthorized(new { error = "Refresh token expirado", code = "EXPIRED_REFRESH_TOKEN" });
        }

        var tokens = GenerateTokens(tokenInfo.Username, tokenInfo.Role);
        _logger.LogInformation("Token renovado para: {Username}", tokenInfo.Username);
        return Ok(tokens);
    }

    private TokenResponse GenerateTokens(string username, string role)
    {
        // Limpiar tokens expirados en cada generación para prevenir memory leak
        CleanupExpiredTokens();

        var jwtKey = _configuration["Jwt:Key"] 
            ?? throw new InvalidOperationException("Jwt:Key no configurado. Defina la variable de entorno Jwt__Key.");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "TaskService.Api";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "TaskService.Client";
        var expirationMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var minutes) ? minutes : 15;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        // Generar refresh token seguro
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        _refreshTokens[refreshToken] = new RefreshTokenInfo
        {
            Username = username,
            Role = role,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };

        return new TokenResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = expirationMinutes * 60,
            TokenType = "Bearer"
        };
    }

    // Limpiar tokens expirados (se podría ejecutar en un background service)
    internal static void CleanupExpiredTokens()
    {
        var expired = _refreshTokens.Where(x => x.Value.ExpiresAt < DateTime.UtcNow).Select(x => x.Key).ToList();
        foreach (var key in expired) _refreshTokens.TryRemove(key, out _);
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256, 32);
        var result = new byte[48];
        Buffer.BlockCopy(salt, 0, result, 0, 16);
        Buffer.BlockCopy(hash, 0, result, 16, 32);
        return Convert.ToBase64String(result);
    }

    private static bool VerifyPassword(string password, string storedHash)
    {
        var data = Convert.FromBase64String(storedHash);
        if (data.Length != 48) return false;
        var salt = data[..16];
        var expectedHash = data[16..];
        var actualHash = System.Security.Cryptography.Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(password), salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256, 32);
        return CryptographicOperations.FixedTimeEquals(expectedHash, actualHash);
    }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RefreshRequest
{
    public string RefreshToken { get; set; } = string.Empty;
}

public class TokenResponse
{
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int ExpiresIn { get; set; }
    public string TokenType { get; set; } = "Bearer";
}

internal class RefreshTokenInfo
{
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}

internal class RegisteredUser
{
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? FullName { get; set; }
}
