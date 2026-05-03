namespace Treinamentos.Domain.Entities;

public class Company
{
    public Guid Id { get; set; }
    public int Empresa { get; set; }
    public int Revenda { get; set; }
    public string RazaoSocial { get; set; } = string.Empty;
    public string NomeFantasia { get; set; } = string.Empty;
    public string Cnpj { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<User> Users { get; set; } = [];
    public ICollection<Course> Courses { get; set; } = [];
}