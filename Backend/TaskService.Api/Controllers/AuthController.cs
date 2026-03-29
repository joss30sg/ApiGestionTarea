using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace TaskService.Api.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    // Almacén en memoria de refresh tokens (en producción usar BD)
    private static readonly Dictionary<string, RefreshTokenInfo> _refreshTokens = new();

    public AuthController(IConfiguration configuration, ILogger<AuthController> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    /// <summary>
    /// LOGIN - Obtener JWT y Refresh Token
    /// </summary>
    /// <remarks>
    /// Credenciales de desarrollo: admin / admin123
    /// </remarks>
    [HttpPost("login")]
    [ProducesResponseType(typeof(TokenResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        // Validar credenciales (en producción usar Identity o BD)
        var validUser = _configuration["Auth:Username"] ?? "admin";
        var validPassword = _configuration["Auth:Password"] ?? "admin123";

        if (request.Username != validUser || request.Password != validPassword)
        {
            _logger.LogWarning("Intento de login fallido para usuario: {Username} desde {IP}",
                request.Username, HttpContext.Connection.RemoteIpAddress);
            return Unauthorized(new { error = "Credenciales inválidas", code = "INVALID_CREDENTIALS" });
        }

        var tokens = GenerateTokens(request.Username);
        _logger.LogInformation("Login exitoso: {Username}", request.Username);
        return Ok(tokens);
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

        if (!_refreshTokens.TryGetValue(request.RefreshToken, out var tokenInfo))
        {
            _logger.LogWarning("Refresh token inválido utilizado");
            return Unauthorized(new { error = "Refresh token inválido", code = "INVALID_REFRESH_TOKEN" });
        }

        if (tokenInfo.ExpiresAt < DateTime.UtcNow)
        {
            _refreshTokens.Remove(request.RefreshToken);
            _logger.LogWarning("Refresh token expirado para usuario: {Username}", tokenInfo.Username);
            return Unauthorized(new { error = "Refresh token expirado", code = "EXPIRED_REFRESH_TOKEN" });
        }

        // Revocar el refresh token anterior (rotación de tokens)
        _refreshTokens.Remove(request.RefreshToken);

        var tokens = GenerateTokens(tokenInfo.Username);
        _logger.LogInformation("Token renovado para: {Username}", tokenInfo.Username);
        return Ok(tokens);
    }

    private TokenResponse GenerateTokens(string username)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "TaskServiceSecretKey2026!MinLength32Chars";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "TaskService.Api";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "TaskService.Client";
        var expirationMinutes = int.Parse(_configuration["Jwt:ExpirationMinutes"] ?? "15");

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, "User"),
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
        foreach (var key in expired) _refreshTokens.Remove(key);
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
    public DateTime ExpiresAt { get; set; }
}
