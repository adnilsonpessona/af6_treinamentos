using Treinamentos.Application.Interfaces;
using Treinamentos.Application.Services;
using Treinamentos.Domain.Interfaces;
using Treinamentos.Infrastructure.Data;
using Treinamentos.Infrastructure.Email;
using Treinamentos.Infrastructure.Pdf;
using Treinamentos.Infrastructure.Services;
using Treinamentos.Infrastructure.Storage;

namespace Treinamentos.API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        // Unit of Work
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Infrastructure services
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<IStorageService, StorageService>();
        services.AddScoped<IPdfService, PdfService>();

        // Application services
        services.AddScoped<AuthService>();
        services.AddScoped<UserService>();
        services.AddScoped<CompanyService>();
        services.AddScoped<DepartmentService>();
        services.AddScoped<CategoryService>();
        services.AddScoped<CourseService>();
        services.AddScoped<ProgressService>();
        services.AddScoped<ReportService>();
        services.AddScoped<AuditService>();

        return services;
    }
}
