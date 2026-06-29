using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using SeguraLegal.API.Models;
using SeguraLegal.Domain.Entities;
using SeguraLegal.Infrastructure.Persistence;

namespace SeguraLegal.API.Services;

public sealed class EfSiteContentStore : ISiteContentStore
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };

    private readonly SeguraDbContext _dbContext;

    public EfSiteContentStore(SeguraDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SiteContentDocument> GetAsync(CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.SiteContents
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == 1, cancellationToken);

        if (entity is null || string.IsNullOrWhiteSpace(entity.ContentJson))
        {
            var seeded = DefaultSiteContentFactory.Create();
            await SaveAsync(seeded, cancellationToken);
            return seeded;
        }

        var content = JsonSerializer.Deserialize<SiteContentDocument>(entity.ContentJson, JsonOptions)
            ?? DefaultSiteContentFactory.Create();

        content.UpdatedAt = entity.UpdatedAt;
        return content;
    }

    public async Task<SiteContentDocument> SaveAsync(SiteContentDocument content, CancellationToken cancellationToken = default)
    {
        content.UpdatedAt = DateTime.UtcNow;
        var json = JsonSerializer.Serialize(content, JsonOptions);
        var entity = await _dbContext.SiteContents.FirstOrDefaultAsync(x => x.Id == 1, cancellationToken);

        if (entity is null)
        {
            _dbContext.SiteContents.Add(new SiteContent
            {
                Id = 1,
                ContentJson = json,
                UpdatedAt = content.UpdatedAt
            });
        }
        else
        {
            entity.ContentJson = json;
            entity.UpdatedAt = content.UpdatedAt;
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        return content;
    }
}