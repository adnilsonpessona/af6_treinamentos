using Microsoft.EntityFrameworkCore;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces.Repositories;
using Treinamentos.Infrastructure.Data;

namespace Treinamentos.Infrastructure.Repositories;

public class VideoProgressRepository : Repository<VideoProgress>, IVideoProgressRepository
{
    public VideoProgressRepository(AppDbContext context) : base(context) { }

    public async Task<VideoProgress?> GetByUserAndLessonAsync(Guid userId, Guid lessonId)
        => await _dbSet.FirstOrDefaultAsync(v => v.UserId == userId && v.LessonId == lessonId);
}
