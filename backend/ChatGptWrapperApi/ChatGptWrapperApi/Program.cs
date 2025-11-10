using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OpenAI.Chat;

var builder = WebApplication.CreateBuilder(args);

// Bind your OpenAI API key + optional default model name
var config = builder.Configuration;
string apiKey = config["OpenAI:ApiKey"] ?? throw new InvalidOperationException("Missing OpenAI:ApiKey");
string model = config["OpenAI:Model"] ?? "gpt-3.5-turbo";

// Register ChatClient as a singleton
builder.Services.AddSingleton<ChatClient>(_ =>
    new ChatClient(model: model, apiKey: apiKey)  // ?? uses OpenAI.Chat.ChatClient :contentReference[oaicite:0]{index=0}
);

builder.Services.AddControllers();
builder.Services.AddCors(o => o.AddPolicy("AllowReactApp", p =>
    p.AllowAnyHeader()
     .AllowAnyMethod()
     .WithOrigins("http://localhost:3000")
));

var app = builder.Build();

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.MapControllers();
app.Run();
