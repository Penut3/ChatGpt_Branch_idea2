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
                ValidAudiences = new[] { "authenticated", "https://primocommunication.no" },

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
        if (principal.Identity is not ClaimsIdentity id) return Task.FromResult(principal);

        // map raw "email" → ClaimTypes.Email (if present & not already mapped)
        var rawEmail = id.FindFirst("email")?.Value;
        if (!string.IsNullOrWhiteSpace(rawEmail) &&
            !id.Claims.Any(c => c.Type == ClaimTypes.Email))
        {
            id.AddClaim(new Claim(ClaimTypes.Email, rawEmail));
        }
        // Parse app_metadata JSON once
        var metaJson = id.FindFirst("app_metadata")?.Value;
        if (string.IsNullOrWhiteSpace(metaJson)) return Task.FromResult(principal);

        try
        {
            using var doc = JsonDocument.Parse(metaJson);
            var root = doc.RootElement;

            // roles → ClaimTypes.Role
            if (!id.Claims.Any(c => c.Type == ClaimTypes.Role) &&
                root.TryGetProperty("roles", out var roles) &&
                roles.ValueKind == JsonValueKind.Array)
            {
                foreach (var r in roles.EnumerateArray())
                {
                    var role = r.GetString();
                    if (!string.IsNullOrWhiteSpace(role))
                        id.AddClaim(new Claim(ClaimTypes.Role, role));
                }
            }

            // businesses → "Business"
            if (root.TryGetProperty("businesses", out var businesses) && 
                businesses.ValueKind == JsonValueKind.Array)
            {
                // avoid duplicates
                var existing = new HashSet<string>(
                    id.FindAll("Business").Select(c => c.Value),
                    StringComparer.OrdinalIgnoreCase);

                foreach (var b in businesses.EnumerateArray())
                {
                    var name = b.GetString();
                    if (!string.IsNullOrWhiteSpace(name) && !existing.Contains(name))
                        id.AddClaim(new Claim("Business", name));
                }
            }

            //dbUserId claim
            if (!id.Claims.Any(c => c.Type == "dbUserId") &&
                 root.TryGetProperty("dbUserId", out var userIdEl) &&
                 userIdEl.ValueKind == JsonValueKind.String &&
                 Guid.TryParse(userIdEl.GetString(), out var guid))
            {
                id.AddClaim(new Claim("dbUserId", guid.ToString("D")));
            }

        }
        catch
        {
            // ignore JSON parse errors
        }

        return Task.FromResult(principal);
    }
}
