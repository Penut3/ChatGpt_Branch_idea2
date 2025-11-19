
using Application.Interfaces.Services;
using Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Application
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            AddServices(services);
            //services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
            services.AddTransient<IChatService, ChatService>();
            
            return services;
        }

        private static IServiceCollection AddServices(IServiceCollection services)
        {
          

            return services;
        }
    }
}