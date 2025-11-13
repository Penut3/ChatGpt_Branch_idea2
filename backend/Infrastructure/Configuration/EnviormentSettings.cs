using Domain.Helpers;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Configuration;

public class EnvironmentSettings : IEnvironmentSettings
{
    public string JwtSecretKey { get; private set; }
    public string Issuer { get; private set; }
    public string Audience { get; private set; }

    //public EnvironmentSettings(IConfiguration configuration)
    //{

    //    JwtSecretKey = configuration.GetValue<string>("Jwt:Key");
    //    Issuer = configuration.GetValue<string>("Jwt:Issuer");
    //    Audience = configuration.GetValue<string>("Jwt:Audience");
    //}
}