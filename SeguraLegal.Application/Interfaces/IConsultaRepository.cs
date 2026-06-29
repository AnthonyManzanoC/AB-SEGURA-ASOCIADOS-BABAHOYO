using SeguraLegal.Domain.Entities;

namespace SeguraLegal.Application.Interfaces;

public interface IConsultaRepository
{
    Task AgregarAsync(Consulta consulta);
    Task GuardarCambiosAsync();
}