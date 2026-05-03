namespace Treinamentos.Domain.Entities;

public class CourseUserPermission
{
    public Guid CourseId { get; set; }
    public Guid UserId { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Course Course { get; set; } = null!;
    public User User { get; set; } = null!;
}
