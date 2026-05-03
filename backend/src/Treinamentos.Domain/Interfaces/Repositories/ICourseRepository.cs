using Treinamentos.Domain.Entities;

namespace Treinamentos.Domain.Interfaces.Repositories;

public interface ICourseRepository : IRepository<Course>
{
    Task<Course?> GetWithLessonsAsync(Guid id);
    Task<IEnumerable<Course>> GetPublishedForUserAsync(Guid userId, string department, Guid? companyId);
    Task<IEnumerable<Course>> GetByInstructorAsync(Guid instructorId);
}
