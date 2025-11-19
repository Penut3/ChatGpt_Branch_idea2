using Application;
using Application.Interfaces.Services;
using DotNetEnv;
using Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using OpenAI;
using OpenAI.Chat;
using System.ClientModel;

using System;
//using Presentation.Identity;
using System.Security.Claims;


var builder = WebApplication.CreateBuilder(args);

// Load environment variables from .env
Env.Load("C:\\Users\\sande\\Documents\\GitHub\\ChatGPT_Branch_Concept2\\backend\\.env");
var githubToken = Environment.GetEnvironmentVariable("GITHUB_MODELS_TOKEN");

// Register infrastructure + application layers
builder.Services.AddHttpClient(); // must be before SupabaseAuthServic
builder.Services.AddHttpContextAccessor();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddApplication();
//builder.Services.AddScoped<ICurrentUser, CurrentUser>();

// Add authentication & authorization
builder.Services.AddUserValidation();

//builder.Services.AddAuthorization(options =>
//{
//    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
//    options.AddPolicy("UserOnly", policy => policy.RequireRole("User"));
//});

// Add controllers & JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.AddEndpointsApiExplorer();


// Swagger setup with JWT support
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "PrimoSSO API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token. Example: `Bearer eyJhb...`",
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("SuperAdmin", policy =>
    {
        policy.RequireAuthenticatedUser();
        policy.RequireRole("Primo_Admin");
        policy.RequireClaim("Business", "Primo");
       
    });

    options.AddPolicy("AnyBusinessAdmin", policy =>
    policy.RequireAuthenticatedUser()
          .RequireAssertion(ctx =>
              ctx.User.Claims
                 .Where(c => c.Type == ClaimTypes.Role || c.Type == "role")
                 .Any(c => c.Value.EndsWith("_Admin", StringComparison.OrdinalIgnoreCase))
          ));

    options.AddPolicy("BusinessAccess", policy =>
        policy.RequireClaim("Business", "Primo"));

    //options.AddPolicy("AdminOrManager", policy =>
    //    policy.RequireAssertion(context =>
    //        context.User.IsInRole("Admin") || context.User.IsInRole("Manager")));
});


builder.Services.AddSingleton<ChatClient>(_ =>
{
    return new ChatClient(
        model: "openai/gpt-5",                               // same as in your Node app
        credential: new ApiKeyCredential(githubToken),
        options: new OpenAIClientOptions
        {
            Endpoint = new Uri("https://models.github.ai/inference")
        });
});

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(
                "http://localhost:3000",             // dev
                "https://primocommunication.no", // prod SPA origin
                "http://localhost:5173"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            // Optional if you need wildcard subdomains:
            // .SetIsOriginAllowed(origin => new Uri(origin).Host.EndsWith(".yourdomain.com"))
    );
});

var app = builder.Build();

// Swagger UI only in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("Frontend");

// Authentication + Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.Run();
