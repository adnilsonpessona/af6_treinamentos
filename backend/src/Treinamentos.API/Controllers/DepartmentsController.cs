using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Treinamentos.Application.DTOs.Departments;
using Treinamentos.Application.Services;

namespace Treinamentos.API.Controllers;

[ApiController]
[Route("api/v1/departments")]
public class DepartmentsController : ControllerBase
{
    private readonly DepartmentService _departmentService;

    public DepartmentsController(DepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetAll([FromQuery] bool? activeOnly)
    {
        var depts = await _departmentService.GetAllAsync(activeOnly);
        return Ok(depts);
    }

    [HttpGet("{id}")]
    [Authorize]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var dept = await _departmentService.GetByIdAsync(id);
            return Ok(dept);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Create([FromBody] CreateDepartmentRequest request)
    {
        try
        {
            var dept = await _departmentService.CreateAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = dept.Id }, dept);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDepartmentRequest request)
    {
        try
        {
            var dept = await _departmentService.UpdateAsync(id, request);
            return Ok(dept);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/activate")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Activate(Guid id)
    {
        try
        {
            await _departmentService.SetStatusAsync(id, true);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/deactivate")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Deactivate(Guid id)
    {
        try
        {
            await _departmentService.SetStatusAsync(id, false);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _departmentService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}
