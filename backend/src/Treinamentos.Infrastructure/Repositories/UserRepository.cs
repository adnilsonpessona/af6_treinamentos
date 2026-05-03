using Microsoft.EntityFrameworkCore;
using Treinamentos.Domain.Entities;
using Treinamentos.Domain.Interfaces.Repositories;
using Treinamentos.Infrastructure.Data;

namespace Treinamentos.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
        => await _dbSet.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<User?> GetByCpfAsync(string cpf)
        => await _dbSet.FirstOrDefaultAsync(u => u.Cpf == cpf);

    public async Task<User?> GetByGoogleIdAsync(string googleId)
        => await _dbSet.FirstOrDefaultAsync(u => u.GoogleId == googleId);

    public async Task<IEnumerable<User>> GetByDepartmentAsync(string department)
        => await _dbSet.Where(u => u.Department == department).ToListAsync();
}
