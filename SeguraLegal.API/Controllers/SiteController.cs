using Microsoft.AspNetCore.Mvc;
using SeguraLegal.API.Services;

namespace SeguraLegal.API.Controllers;

[ApiController]
[Route("api/site")]
public class SiteController : ControllerBase
{
    private readonly ISiteContentStore _contentStore;

    public SiteController(ISiteContentStore contentStore)
    {
        _contentStore = contentStore;
    }

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var content = await _contentStore.GetAsync(cancellationToken);
        return Ok(SiteContentNormalizer.Normalize(content));
    }
}
