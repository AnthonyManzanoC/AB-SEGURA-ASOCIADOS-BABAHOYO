using Microsoft.EntityFrameworkCore;
using SeguraLegal.Domain.Entities;

namespace SeguraLegal.Infrastructure.Persistence;

public class SeguraDbContext : DbContext
{
    public SeguraDbContext(DbContextOptions<SeguraDbContext> options) : base(options) { }

    public DbSet<Consulta> Consultas { get; set; }
    public DbSet<SiteContent> SiteContents { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Consulta>(entity =>
        {
            entity.ToTable("consultas_legales");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nombre).IsRequired().HasMaxLength(150);
            entity.Property(e => e.Telefono).IsRequired().HasMaxLength(20);
        });

        modelBuilder.Entity<SiteContent>(entity =>
        {
            entity.ToTable("site_content");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id)
                .HasColumnName("id")
                .ValueGeneratedNever(); // Registro singleton: Id siempre es 1, no es auto-increment
            entity.Property(e => e.ContentJson)
                .HasColumnName("content_json")
                .IsRequired();
            entity.Property(e => e.UpdatedAt)
                .HasColumnName("updated_at")
                .IsRequired();
        });
    }
}