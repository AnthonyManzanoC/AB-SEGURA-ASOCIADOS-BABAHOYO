namespace SeguraLegal.API.Models;

public sealed class SiteContentDocument
{
    public SiteMeta Meta { get; set; } = new();
    public BrandContent Brand { get; set; } = new();
    public HeroContent Hero { get; set; } = new();
    public SectionContent TeamSection { get; set; } = new();
    public SectionContent ServicesSection { get; set; } = new();
    public SectionContent AuthoritySection { get; set; } = new();
    public List<StatContent> Stats { get; set; } = [];
    public List<TeamMemberContent> Team { get; set; } = [];
    public List<ServiceContent> Services { get; set; } = [];
    public List<AuthorityPointContent> AuthorityPoints { get; set; } = [];
    public ContactContent Contact { get; set; } = new();
    public VisualContent Visuals { get; set; } = new();
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public sealed class SiteMeta
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Keywords { get; set; } = string.Empty;
}

public sealed class BrandContent
{
    public string Name { get; set; } = string.Empty;
    public string LegalName { get; set; } = string.Empty;
    public string ShortName { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
}

public sealed class HeroContent
{
    public string Eyebrow { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Highlight { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string PrimaryCta { get; set; } = string.Empty;
    public string SecondaryCta { get; set; } = string.Empty;
}

public sealed class SectionContent
{
    public string Eyebrow { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Highlight { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public sealed class StatContent
{
    public string Value { get; set; } = string.Empty;
    public string Label { get; set; } = string.Empty;
}

public sealed class TeamMemberContent
{
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public string Badge { get; set; } = string.Empty;
    public string Summary { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string Accent { get; set; } = "gold";
    public List<string> Tags { get; set; } = [];
}

public sealed class ServiceContent
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Coverage { get; set; } = string.Empty;
    public string Icon { get; set; } = "shield";
}

public sealed class AuthorityPointContent
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
}

public sealed class ContactContent
{
    public string Phone { get; set; } = string.Empty;
    public string WhatsApp { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string OfficeHours { get; set; } = string.Empty;
    public string MapUrl { get; set; } = string.Empty;
    public List<string> CoverageCities { get; set; } = [];
    public List<SocialLinkContent> SocialLinks { get; set; } = [];
}

public sealed class SocialLinkContent
{
    public string Label { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}

public sealed class VisualContent
{
    public string LogoUrl { get; set; } = string.Empty;
    public string HeroImageUrl { get; set; } = "/assets/segura-office.png";
}

public sealed class AdminLoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}
