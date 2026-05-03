using Microsoft.EntityFrameworkCore;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Enums;
using Treinamentos.Domain.Interfaces.Repositories;
using Treinamentos.Infrastructure.Data;

namespace Treinamentos.Infrastructure.Repositories;

public class CourseRepository : Repository<Course>, ICourseRepository
{
    public CourseRepository(AppDbContext context) : base(context) { }

    public async Task<Course?> GetWithLessonsAsync(Guid id)
        => await _dbSet
            .Include(c => c.Lessons.OrderBy(l => l.Order))
            .Include(c => c.Category)
            .Include(c => c.SubCategory)
            .Include(c => c.Company)
            .Include(c => c.Instructor)
            .FirstOrDefaultAsync(c => c.Id == id);

    public async Task<IEnumerable<Course>> GetPublishedForUserAsync(Guid userId, string department, Guid? companyId)
        => await _dbSet
            .Where(c => c.Status == CourseStatus.Publicado &&
                (c.UserPermissions.Any(p => p.UserId == userId) ||
                 ((c.AvailableForAllCompanies || (companyId.HasValue && c.CompanyId == companyId.Value)) &&
                  (c.AvailableForAllDepartments || c.Department == department || c.DepartmentPermissions.Any(p => p.Department == department)))))
            .Include(c => c.Category)
            .Include(c => c.SubCategory)
            .Include(c => c.Company)
            .ToListAsync();

    public async Task<IEnumerable<Course>> GetByInstructorAsync(Guid instructorId)
        => await _dbSet
            .Where(c => c.InstructorId == instructorId)
            .Include(c => c.Category)
            .ToListAsync();
}
