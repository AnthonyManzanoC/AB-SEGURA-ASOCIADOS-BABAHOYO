namespace SeguraLegal.Domain.Entities;

public class SiteContent
{
    public int Id { get; set; } = 1;
    public string ContentJson { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
