namespace Domain.Helpers;

public interface IEnvironmentSettings
{
    string Issuer { get; }
    string Audience { get; }
    string JwtSecretKey { get; }

}