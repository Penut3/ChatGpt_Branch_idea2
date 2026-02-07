using Application.DTOs.SupabaseDto;
using Application.Interfaces.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Json;
using System.Numerics;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Services
{
    public class SupabaseService : ISupabaseService
    {
        private readonly HttpClient _httpClient;
        private readonly string _supabaseUrl;
        private readonly string _supabaseKey;
        private readonly string _supabaseAnon;
        private readonly string _supabaseSecret;

        public SupabaseService(HttpClient httpClient)
        {
            _httpClient = httpClient;
            _supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
            _supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");
            _supabaseSecret = Environment.GetEnvironmentVariable("SUPABASE_SECRET");
            _supabaseAnon = Environment.GetEnvironmentVariable("SUPABASE_ANON");
        }

        public async Task<SupabaseUserDto> CreateAuthUserAsync(SupabaseCreateUserDto userDto)

        {
            // Use flat arrays + correct property names
            var payload = new
            {
                email = userDto.Email,
                password = userDto.Password,
                email_confirm = true,
                app_metadata = new
                {
                    dbUserId = userDto.UserId.ToString(),
                }
            };

            //TEMP DEBUG
            var debugJson = JsonSerializer.Serialize(payload);
            //Console.WriteLine($"[CreateAuthUser] Payload: {debugJson}");

            var request = new HttpRequestMessage(HttpMethod.Post, $"{_supabaseUrl}/auth/v1/admin/users");
            request.Headers.Add("apikey", _supabaseKey);               // service role key required for admin
            request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");
            request.Content = JsonContent.Create(payload);

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new Exception($"Supabase user creation failed: {response.StatusCode} - {errorBody}");
            }

            var json = await response.Content.ReadAsStringAsync();

            // Admin create returns the user object directly (not wrapped)
            var user = JsonSerializer.Deserialize<SupabaseUserDto>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;

            return user;
        }


        public async Task<SupabaseLoginResponseDto> SupabaseLoginAsync(string email, string password)
        {
            var payload = new { email, password };

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"{_supabaseUrl}/auth/v1/token?grant_type=password"
            );

            // Use publishable/anon key for token endpoints
            request.Headers.Add("apikey", _supabaseAnon);

            request.Content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Supabase login failed: {response.StatusCode} - {errorContent}");
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SupabaseLoginResponseDto>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;
        }
    }
}
