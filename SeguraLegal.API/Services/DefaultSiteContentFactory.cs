using SeguraLegal.API.Models;

namespace SeguraLegal.API.Services;

public static class DefaultSiteContentFactory
{
    public static SiteContentDocument Create()
    {
        return new SiteContentDocument
        {
            Meta = new SiteMeta
            {
                Title = "Segura & Manzano | Abogados Asociados en Los Rios",
                Description = "Estudio juridico moderno en Montalvo, Babahoyo y la provincia de Los Rios, liderado por la Ex Jueza Civil Abg. Zoila Maria Segura Egas.",
                Keywords = "abogados Montalvo, abogados Babahoyo, estudio juridico Los Rios, derecho civil, defensa penal, derecho de familia"
            },
            Brand = new BrandContent
            {
                Name = "Segura & Manzano",
                LegalName = "Segura & Manzano | Abogados Asociados",
                ShortName = "SM",
                Tagline = "Experiencia judicial y estrategia legal moderna"
            },
            Hero = new HeroContent
            {
                Eyebrow = "Estudio juridico en Montalvo y Los Rios",
                Title = "La experiencia que impone respeto.",
                Highlight = "La estrategia que mueve el caso.",
                Subtitle = "Servicios legales claros, firmes y modernos para personas, familias y negocios de Montalvo, Babahoyo, Mata de Cacao, Simon Bolivar, Pueblo Nuevo y toda la provincia de Los Rios.",
                PrimaryCta = "Consultar por WhatsApp",
                SecondaryCta = "Ver servicios"
            },
            TeamSection = new SectionContent
            {
                Eyebrow = "Nuestro poder",
                Title = "Dos perfiles. Una firma con criterio.",
                Highlight = "Autoridad + velocidad",
                Description = "La trayectoria judicial de una ex jueza se combina con una forma nueva de trabajar: comunicacion directa, estrategia ordenada y respuesta agil."
            },
            ServicesSection = new SectionContent
            {
                Eyebrow = "Areas de practica",
                Title = "Defensa y asesoria para causas reales.",
                Highlight = "Sin vueltas",
                Description = "Trabajamos asuntos civiles, familiares, penales, transito, laborales, contractuales e inmobiliarios con enfoque local en la provincia de Los Rios."
            },
            AuthoritySection = new SectionContent
            {
                Eyebrow = "Por que elegirnos",
                Title = "Un estudio nuevo, con experiencia de sala.",
                Highlight = "Y mentalidad actual",
                Description = "No vendemos promesas vacias. Escuchamos, ordenamos el caso, explicamos escenarios y actuamos con la seriedad que exige cada proceso."
            },
            Stats =
            [
                new StatContent { Value = "Ex Jueza", Label = "liderazgo juridico civil" },
                new StatContent { Value = "Los Rios", Label = "cobertura provincial" },
                new StatContent { Value = "Directo", Label = "atencion por WhatsApp" }
            ],
            Team =
            [
                new TeamMemberContent
                {
                    Name = "Abg. Zoila Maria Segura Egas",
                    Role = "Socia principal",
                    Badge = "Ex Jueza de lo Civil",
                    Summary = "Autoridad juridica, experiencia real en despacho judicial y criterio probado para leer el fondo de cada conflicto.",
                    Bio = "Su experiencia como Ex Jueza de lo Civil del canton Montalvo aporta una mirada seria, tecnica y profundamente practica en la construccion de cada estrategia.",
                    Accent = "gold",
                    Tags = [ "Civil", "Familia", "Contratos", "Criterio judicial" ]
                },
                new TeamMemberContent
                {
                    Name = "Abg. Julio Anthony Manzano Coronel",
                    Role = "Abogado asociado",
                    Badge = "Innovacion y estrategia legal",
                    Summary = "Sangre nueva para impulsar comunicacion rapida, orden digital y seguimiento claro de cada asunto.",
                    Bio = "Aporta una vision moderna del servicio legal: velocidad, tecnologia, organizacion y trato directo para que el cliente sepa donde esta parado.",
                    Accent = "blue",
                    Tags = [ "Estrategia", "Tecnologia", "Seguimiento", "Respuesta agil" ]
                }
            ],
            Services =
            [
                new ServiceContent { Title = "Derecho civil", Description = "Demandas, obligaciones, contratos, cobros, conflictos entre particulares y defensa en procesos civiles.", Coverage = "Asesoria civil en Montalvo, Babahoyo y Los Rios.", Icon = "scale" },
                new ServiceContent { Title = "Familia y niñez", Description = "Divorcios, alimentos, tenencia, regimen de visitas, particiones y acuerdos familiares.", Coverage = "Atencion humana y firme para familias de la provincia.", Icon = "family" },
                new ServiceContent { Title = "Defensa penal", Description = "Analisis del caso, acompanamiento, defensa tecnica y actuacion urgente cuando el tiempo importa.", Coverage = "Respuesta en Babahoyo, Montalvo y cantones cercanos.", Icon = "shield" },
                new ServiceContent { Title = "Transito", Description = "Accidentes, infracciones, impugnaciones, reparacion integral y defensa en procesos de transito.", Coverage = "Cobertura en vias y juzgados de Los Rios.", Icon = "route" },
                new ServiceContent { Title = "Laboral", Description = "Despidos, liquidaciones, actas, acuerdos, reclamos y defensa de derechos laborales.", Coverage = "Soluciones para trabajadores y empleadores.", Icon = "briefcase" },
                new ServiceContent { Title = "Inmobiliario y tierras", Description = "Compraventas, posesion, saneamiento, conflictos de predios, escrituras y asesoria preventiva.", Coverage = "Acompanamiento local en zonas urbanas y rurales.", Icon = "building" }
            ],
            AuthorityPoints =
            [
                new AuthorityPointContent { Title = "Lectura judicial del conflicto", Description = "La experiencia en judicatura permite anticipar riesgos, ordenar pruebas y entender como se sostiene una posicion legal." },
                new AuthorityPointContent { Title = "Comunicacion clara", Description = "Explicamos el caso sin laberintos. El cliente entiende los escenarios, los tiempos y el siguiente movimiento." },
                new AuthorityPointContent { Title = "Presencia local", Description = "Conocemos Montalvo, Babahoyo, Mata de Cacao, Simon Bolivar, Pueblo Nuevo y el ritmo real de la provincia." },
                new AuthorityPointContent { Title = "Ejecucion moderna", Description = "Usamos herramientas digitales para ordenar informacion, acelerar respuesta y dar seguimiento sin perder formalidad." }
            ],
            Contact = new ContactContent
            {
                Phone = "+593 XX XXX XXXX",
                WhatsApp = "593XXXXXXXXX",
                Email = "contacto@seguramanzano.com",
                Address = "Montalvo, provincia de Los Rios, Ecuador",
                OfficeHours = "Lunes a viernes, 08:00 - 18:00. Sabados con cita previa.",
                MapUrl = "https://www.google.com/maps/search/Montalvo,+Los+Rios,+Ecuador",
                CoverageCities = [ "Montalvo", "Babahoyo", "Mata de Cacao", "Simon Bolivar", "Pueblo Nuevo", "Ventanas", "Quevedo", "Toda la provincia de Los Rios" ],
                SocialLinks =
                [
                    new SocialLinkContent { Label = "Facebook", Url = "#" },
                    new SocialLinkContent { Label = "Instagram", Url = "#" },
                    new SocialLinkContent { Label = "TikTok", Url = "#" }
                ]
            },
            Visuals = new VisualContent
            {
                LogoUrl = string.Empty,
                HeroImageUrl = "/assets/segura-office.png"
            },
            UpdatedAt = DateTime.UtcNow
        };
    }
}
