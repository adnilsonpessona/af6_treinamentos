using Treinamentos.Domain.Entities;

namespace Treinamentos.Domain.Interfaces.Repositories;

public interface IVideoProgressRepository : IRepository<VideoProgress>
{
    Task<VideoProgress?> GetByUserAndLessonAsync(Guid userId, Guid lessonId);
}
