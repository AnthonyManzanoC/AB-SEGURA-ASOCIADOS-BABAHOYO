using SeguraLegal.Application.Interfaces;
using SeguraLegal.Domain.Entities;
using SeguraLegal.Infrastructure.Persistence;

namespace SeguraLegal.Infrastructure.Repositories;

public class ConsultaRepository : IConsultaRepository
{
    private readonly SeguraDbContext _context;

    public ConsultaRepository(SeguraDbContext context)
    {
        _context = context;
    }

    public async Task AgregarAsync(Consulta consulta)
    {
        await _context.Consultas.AddAsync(consulta);
    }

    public async Task GuardarCambiosAsync()
    {
        await _context.SaveChangesAsync();
    }
}