using SeguraLegal.API.Models;

namespace SeguraLegal.API.Services;

public static class SiteContentNormalizer
{
    public static SiteContentDocument Normalize(SiteContentDocument? content)
    {
        content ??= DefaultSiteContentFactory.Create();

        content.Meta ??= new SiteMeta();
        content.Brand ??= new BrandContent();
        content.Hero ??= new HeroContent();
        content.TeamSection ??= new SectionContent();
        content.ServicesSection ??= new SectionContent();
        content.AuthoritySection ??= new SectionContent();
        content.Stats ??= [];
        content.Team ??= [];
        content.Services ??= [];
        content.AuthorityPoints ??= [];
        content.Contact ??= new ContactContent();
        content.Contact.CoverageCities ??= [];
        content.Contact.SocialLinks ??= [];
        content.Visuals ??= new VisualContent();

        foreach (var member in content.Team)
        {
            member.Tags ??= [];
        }

        return content;
    }
}
