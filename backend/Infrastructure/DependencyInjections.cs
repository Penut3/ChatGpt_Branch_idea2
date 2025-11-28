
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Application.Services;
using Domain.Helpers;

using Infrastructure.Configuration;
using Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql.EntityFrameworkCore.PostgreSQL;

namespace Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {

            var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

            services.AddDbContext<DataContext>(options =>
            {
                options.UseNpgsql(connectionString);
            });

            AddRepositories(services);
            AddConfiguration(services, configuration);

            return services;
        }



        private static IServiceCollection AddConfiguration(IServiceCollection services, IConfiguration configuration)
        {
            //services.AddSingleton<IEnvironmentSettings>(provider => new EnvironmentSettings(configuration));

            return services;
        }

        private static IServiceCollection AddRepositories(IServiceCollection services)
        {

            services.AddScoped(typeof(IBaseRepository<>), typeof(BaseRepository<>));

            
            //services.AddScoped<ISupabaseAuthService, SupabaseAuthService>();
            services.AddScoped<ChatService>();
            services.AddScoped<ChatModelService>();
            services.AddScoped<GridService>();

            services.AddScoped<IAiChatService, AiChatService>();
           
            //services.AddScoped<IJwtService, JwtService>();

            return services;
        }

    }
}