using System.Text.Json;
using SeguraLegal.API.Models;

namespace SeguraLegal.API.Services;

public sealed class JsonFileSiteContentStore : ISiteContentStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly string _filePath;

    public JsonFileSiteContentStore(IWebHostEnvironment environment)
    {
        _filePath = Path.Combine(environment.ContentRootPath, "App_Data", "site-content.json");
    }

    public async Task<SiteContentDocument> GetAsync(CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            if (!File.Exists(_filePath))
            {
                var seeded = DefaultSiteContentFactory.Create();
                await SaveUnsafeAsync(seeded, cancellationToken);
                return seeded;
            }

            var json = await File.ReadAllTextAsync(_filePath, cancellationToken);
            return JsonSerializer.Deserialize<SiteContentDocument>(json, JsonOptions)
                ?? DefaultSiteContentFactory.Create();
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<SiteContentDocument> SaveAsync(SiteContentDocument content, CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            await SaveUnsafeAsync(content, cancellationToken);
            return content;
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task SaveUnsafeAsync(SiteContentDocument content, CancellationToken cancellationToken)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);
        content.UpdatedAt = DateTime.UtcNow;
        var json = JsonSerializer.Serialize(content, JsonOptions);
        await File.WriteAllTextAsync(_filePath, json, cancellationToken);
    }
}
