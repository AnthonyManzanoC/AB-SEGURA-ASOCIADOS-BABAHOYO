using Microsoft.AspNetCore.Mvc;
using SeguraLegal.Application.DTOs;
using SeguraLegal.Application.Interfaces;
using SeguraLegal.Domain.Entities;

namespace SeguraLegal.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConsultasController : ControllerBase
{
    private readonly IConsultaRepository _repository;

    public ConsultasController(IConsultaRepository repository)
    {
        _repository = repository;
    }

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] CrearConsultaDto dto)
    {
        var consulta = new Consulta
        {
            Nombre = dto.Nombre,
            Telefono = dto.Telefono,
            Email = dto.Email,
            AreaLegal = dto.AreaLegal,
            Mensaje = dto.Mensaje
        };

        await _repository.AgregarAsync(consulta);
        await _repository.GuardarCambiosAsync();

        return Ok(new { Mensaje = "Consulta registrada con éxito", Id = consulta.Id });
    }
}