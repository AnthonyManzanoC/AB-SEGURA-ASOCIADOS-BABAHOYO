using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace SeguraLegal.API.Services;

public sealed class AdminTokenService
{
    private readonly IConfiguration _configuration;

    public AdminTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool ValidateCredentials(string username, string password)
    {
        var expectedUser = _configuration["Admin:Username"] ?? "admin";
        var expectedPassword = _configuration["Admin:Password"] ?? "SeguraAdmin2026!";

        return FixedTimeEquals(username, expectedUser) && FixedTimeEquals(password, expectedPassword);
    }

    public string CreateToken(string username)
    {
        var now = DateTimeOffset.UtcNow;
        var payload = JsonSerializer.Serialize(new
        {
            sub = username,
            iat = now.ToUnixTimeSeconds(),
            exp = now.AddHours(8).ToUnixTimeSeconds()
        });

        var payloadSegment = Base64UrlEncode(Encoding.UTF8.GetBytes(payload));
        var signatureSegment = Sign(payloadSegment);

        return $"{payloadSegment}.{signatureSegment}";
    }

    public bool TryValidate(string? authorizationHeader, out string username)
    {
        username = string.Empty;

        if (string.IsNullOrWhiteSpace(authorizationHeader) ||
            !authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return false;
        }

        var token = authorizationHeader["Bearer ".Length..].Trim();
        var parts = token.Split('.', 2);
        if (parts.Length != 2)
        {
            return false;
        }

        var expectedSignature = Sign(parts[0]);
        if (!FixedTimeEquals(parts[1], expectedSignature))
        {
            return false;
        }

        try
        {
            var json = Encoding.UTF8.GetString(Base64UrlDecode(parts[0]));
            using var document = JsonDocument.Parse(json);
            var exp = document.RootElement.GetProperty("exp").GetInt64();
            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > exp)
            {
                return false;
            }

            username = document.RootElement.GetProperty("sub").GetString() ?? string.Empty;
            return !string.IsNullOrWhiteSpace(username);
        }
        catch
        {
            return false;
        }
    }

    private string Sign(string payloadSegment)
    {
        var secret = _configuration["Admin:TokenSecret"];
        if (string.IsNullOrWhiteSpace(secret))
        {
            secret = "dev-only-change-this-token-secret-for-segura-manzano";
        }

        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        return Base64UrlEncode(hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadSegment)));
    }

    private static bool FixedTimeEquals(string left, string right)
    {
        var leftBytes = Encoding.UTF8.GetBytes(left);
        var rightBytes = Encoding.UTF8.GetBytes(right);
        return leftBytes.Length == rightBytes.Length &&
               CryptographicOperations.FixedTimeEquals(leftBytes, rightBytes);
    }

    private static string Base64UrlEncode(byte[] bytes)
    {
        return Convert.ToBase64String(bytes)
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
    }

    private static byte[] Base64UrlDecode(string value)
    {
        var padded = value.Replace('-', '+').Replace('_', '/');
        padded += new string('=', (4 - padded.Length % 4) % 4);
        return Convert.FromBase64String(padded);
    }
}
