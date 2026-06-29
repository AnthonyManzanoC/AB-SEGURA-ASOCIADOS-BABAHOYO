using Microsoft.AspNetCore.Mvc;
using SeguraLegal.API.Models;
using SeguraLegal.API.Services;

namespace SeguraLegal.API.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private static readonly HashSet<string> AllowedImageExtensions =
        new(StringComparer.OrdinalIgnoreCase) { ".jpg", ".jpeg", ".png", ".webp" };

    private readonly ISiteContentStore _contentStore;
    private readonly AdminTokenService _tokenService;
    private readonly IWebHostEnvironment _environment;

    public AdminController(
        ISiteContentStore contentStore,
        AdminTokenService tokenService,
        IWebHostEnvironment environment)
    {
        _contentStore = contentStore;
        _tokenService = tokenService;
        _environment = environment;
    }

    [HttpPost("login")]
    public IActionResult Login([FromBody] AdminLoginRequest request)
    {
        if (!_tokenService.ValidateCredentials(request.Username, request.Password))
        {
            return Unauthorized(new { message = "Credenciales invalidas" });
        }

        return Ok(new
        {
            token = _tokenService.CreateToken(request.Username),
            username = request.Username
        });
    }

    [HttpGet("site")]
    public async Task<IActionResult> GetSite(CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
        {
            return Unauthorized(new { message = "Sesion requerida" });
        }

        var content = await _contentStore.GetAsync(cancellationToken);
        return Ok(SiteContentNormalizer.Normalize(content));
    }

    [HttpPut("site")]
    public async Task<IActionResult> SaveSite([FromBody] SiteContentDocument content, CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
        {
            return Unauthorized(new { message = "Sesion requerida" });
        }

        var normalized = SiteContentNormalizer.Normalize(content);
        var saved = await _contentStore.SaveAsync(normalized, cancellationToken);
        return Ok(saved);
    }

    [HttpPost("uploads")]
    [RequestSizeLimit(6_000_000)]
    public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken cancellationToken)
    {
        if (!IsAuthorized())
        {
            return Unauthorized(new { message = "Sesion requerida" });
        }

        if (file.Length == 0)
        {
            return BadRequest(new { message = "El archivo esta vacio" });
        }

        var extension = Path.GetExtension(file.FileName);
        if (!AllowedImageExtensions.Contains(extension))
        {
            return BadRequest(new { message = "Solo se permiten imagenes JPG, PNG o WebP" });
        }

        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var uploadsRoot = Path.Combine(webRoot, "uploads");
        Directory.CreateDirectory(uploadsRoot);

        var safeFileName = $"{DateTime.UtcNow:yyyyMMddHHmmss}-{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        var destinationPath = Path.Combine(uploadsRoot, safeFileName);

        await using (var stream = System.IO.File.Create(destinationPath))
        {
            await file.CopyToAsync(stream, cancellationToken);
        }

        return Ok(new
        {
            url = $"/uploads/{safeFileName}"
        });
    }

    private bool IsAuthorized()
    {
        var header = Request.Headers.Authorization.ToString();
        return _tokenService.TryValidate(header, out _);
    }
}
