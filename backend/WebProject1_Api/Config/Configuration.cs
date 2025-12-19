using System.Text;
using System.Text.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

public static class Configuration
{
    public static IServiceCollection AddUserValidation(this IServiceCollection services)
    {
        var supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL")
            ?? throw new InvalidOperationException("SUPABASE_URL is not set (e.g., https://abcd1234.supabase.co)");
        var issuer = $"{supabaseUrl.TrimEnd('/')}/auth/v1";
        var audience = "authenticated";
        var jwtSecret = Environment.GetEnvironmentVariable("SUPABASE_SECRET")
            ?? throw new InvalidOperationException("SUPABASE_JWT_SECRET (legacy HS256 secret) is not set");

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = true;
            options.SaveToken = true;
            options.MapInboundClaims = false;

            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = signingKey,

                ValidateIssuer = true,
                ValidIssuer = issuer,

                ValidateAudience = true,
                ValidAudience = audience,
                ValidAudiences = new[] { "authenticated" },

                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,

                ValidAlgorithms = new List<string> { SecurityAlgorithms.HmacSha256 },

                NameClaimType = "sub",
                // 🔧 match what the transformer adds:
                RoleClaimType = ClaimTypes.Role
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = ctx =>
                {
                    if (string.IsNullOrEmpty(ctx.Token) &&
                        ctx.Request.Cookies.TryGetValue("AccessToken", out var cookie) &&
                        !string.IsNullOrWhiteSpace(cookie))
                    {
                        ctx.Token = cookie;
                    }
                    return Task.CompletedTask;
                }
            };
        });

        // Flatten roles + businesses from app_metadata
        services.AddSingleton<IClaimsTransformation, SupabaseClaimsTransformation>();

        return services;
    }
}

/// Flattens app_metadata.roles[] -> ClaimTypes.Role
/// and app_metadata.businesses[] -> "Business" claims.
public sealed class SupabaseClaimsTransformation : IClaimsTransformation
{
    public Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
    {
        if (principal.Identity is not ClaimsIdentity id)
            return Task.FromResult(principal);

        // app_metadata is a single JSON claim from Supabase
        var metaJson = id.FindFirst("app_metadata")?.Value;
        if (string.IsNullOrWhiteSpace(metaJson))
            return Task.FromResult(principal);

        try
        {
            using var doc = JsonDocument.Parse(metaJson);
            var root = doc.RootElement;

            // roles → ClaimTypes.Role
            if (root.TryGetProperty("roles", out var rolesProp) &&
                rolesProp.ValueKind == JsonValueKind.String)
            {
                var role = rolesProp.GetString();
                if (!string.IsNullOrWhiteSpace(role) &&
                    !id.HasClaim(ClaimTypes.Role, role))
                {
                    id.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }

            // dbUserId → "dbUserId" claim (and optionally NameIdentifier)
            if (root.TryGetProperty("dbUserId", out var dbUserIdProp) &&
                dbUserIdProp.ValueKind == JsonValueKind.String)
            {
                var dbUserId = dbUserIdProp.GetString();

                if (!string.IsNullOrWhiteSpace(dbUserId))
                {
                    // Custom claim you read in the controller
                    if (!id.HasClaim("dbUserId", dbUserId))
                        id.AddClaim(new Claim("dbUserId", dbUserId));

                    // OPTIONAL: also expose it as NameIdentifier if you like
                    if (!id.HasClaim(ClaimTypes.NameIdentifier, dbUserId))
                        id.AddClaim(new Claim(ClaimTypes.NameIdentifier, dbUserId));
                }
            }
        }
        catch
        {
            // ignore JSON errors, don't break auth
        }

        return Task.FromResult(principal);
    }
}
