namespace Treinamentos.Application.DTOs.Departments;

public record CreateDepartmentRequest(string Name);
public record UpdateDepartmentRequest(string Name);
public record DepartmentResponse(Guid Id, string Name, bool IsActive, DateTime CreatedAt);
