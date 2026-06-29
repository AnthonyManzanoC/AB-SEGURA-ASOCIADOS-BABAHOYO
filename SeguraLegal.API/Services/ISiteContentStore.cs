using SeguraLegal.API.Models;

namespace SeguraLegal.API.Services;

public interface ISiteContentStore
{
    Task<SiteContentDocument> GetAsync(CancellationToken cancellationToken = default);
    Task<SiteContentDocument> SaveAsync(SiteContentDocument content, CancellationToken cancellationToken = default);
}
