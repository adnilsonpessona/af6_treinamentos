using Treinamentos.Domain.Entities;

namespace Treinamentos.Application.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    bool ValidateToken(string token, out Guid userId);
    DateTime GetTokenExpiry(string token);
    string GenerateVideoToken(Guid userId, Guid courseId, Guid lessonId);
    bool ValidateVideoToken(string token, out Guid userId, out Guid courseId, out Guid lessonId);
}
