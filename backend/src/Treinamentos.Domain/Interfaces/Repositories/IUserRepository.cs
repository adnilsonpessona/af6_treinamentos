using Treinamentos.Domain.Entities;

namespace Treinamentos.Domain.Interfaces.Repositories;

public interface IUserRepository : IRepository<User>
{
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByCpfAsync(string cpf);
    Task<User?> GetByGoogleIdAsync(string googleId);
    Task<IEnumerable<User>> GetByDepartmentAsync(string department);
}
