using Microsoft.EntityFrameworkCore;
using SeguraLegal.API.Services;
using SeguraLegal.Application.Interfaces;
using SeguraLegal.Infrastructure.Persistence;
using SeguraLegal.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar controladores (Sin ApiExplorer corrupto)
builder.Services.AddControllers();

// 2. Configurar CORS (Para tu frontend Angular/React y panel local)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://localhost:5173", "http://localhost:5000", "http://localhost:5285")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 3. Configurar Base de Datos Supabase
var supabaseConnection = builder.Configuration.GetConnectionString("Supabase");
var hasSupabaseConnection =
    !string.IsNullOrWhiteSpace(supabaseConnection) &&
    !supabaseConnection.Contains("__", StringComparison.OrdinalIgnoreCase) &&
    !supabaseConnection.Contains("CAMBIAR", StringComparison.OrdinalIgnoreCase);

if (hasSupabaseConnection)
{
    builder.Services.AddDbContext<SeguraDbContext>(options => options.UseNpgsql(supabaseConnection));
    builder.Services.AddScoped<ISiteContentStore, EfSiteContentStore>();
    builder.Services.AddScoped<IConsultaRepository, ConsultaRepository>();
}
else
{
    builder.Services.AddSingleton<ISiteContentStore, JsonFileSiteContentStore>();
}

// 4. Servicios de aplicación
builder.Services.AddSingleton<AdminTokenService>();

var app = builder.Build();

// 5. Configurar Pipeline HTTP
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// 6. Archivos estáticos para tu sitio web y panel admin
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();