using Application.DTOs.UserDto;
using Application.Interfaces.Services;
using Azure.Core;
using Domain.Entities;
using Microsoft.Extensions.Configuration;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using static System.Net.WebRequestMethods;

namespace Infrastructure.Services
{
    public class SupabaseAuthService : ISupabaseAuthService
    {
        private readonly HttpClient _httpClient;
        private readonly string _supabaseUrl;
        private readonly string _supabaseKey;
        private readonly string _supabaseAnon;
        private readonly string _supabaseSecret;

        public SupabaseAuthService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _supabaseUrl = Environment.GetEnvironmentVariable("SUPABASE_URL");
            _supabaseKey = Environment.GetEnvironmentVariable("SUPABASE_SERVICE_ROLE_KEY");
            _supabaseSecret = Environment.GetEnvironmentVariable("SUPABASE_SECRET");
            _supabaseAnon = Environment.GetEnvironmentVariable("SUPABASE_ANON");

        }


        public async Task<SupabaseUser> CreateAuthUserAsync(
        string userId,
        string email,
        string password,
        IEnumerable<string> businessNames,
        IEnumerable<string> roleNames)
        {
            // Use flat arrays + correct property names
            var payload = new
            {
                email,
                password,
                email_confirm = true,
                app_metadata = new
                {
                    dbUserId = userId,
                    roles = roleNames?.ToArray() ?? Array.Empty<string>(),
                    businesses = businessNames?.ToArray() ?? Array.Empty<string>()
                }
            };

            //TEMP DEBUG
            var debugJson = JsonSerializer.Serialize(payload);
            Console.WriteLine($"[CreateAuthUser] Payload: {debugJson}");

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
            var user = JsonSerializer.Deserialize<SupabaseUser>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;

            return user;
        }


        public async Task<SupabaseLoginResponse> SupabaseLoginAsync(string email, string password)
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
            return JsonSerializer.Deserialize<SupabaseLoginResponse>(
                json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;
        }




        // in Infrastructure.Services.SupabaseAuthService
        public async Task<SupabaseLoginResponse> RefreshTokenAsync(string refreshToken)
        {
            var payload = new { refresh_token = refreshToken };

            var request = new HttpRequestMessage(
                HttpMethod.Post,
                $"{_supabaseUrl}/auth/v1/token?grant_type=refresh_token"
            );

            // Use publishable/anon key here (not service role)
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
                throw new HttpRequestException($"Supabase refresh failed: {response.StatusCode} - {errorContent}");
            }

            var json = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SupabaseLoginResponse>(
                json,
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
            )!;
        }

        public async Task LogoutAsync(string accessToken)
        {
            // Revokes the *current* session (refresh token tied to this access token)
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_supabaseUrl}/auth/v1/logout");
            request.Headers.Add("apikey", _supabaseAnon);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            // Empty body is fine
            var response = await _httpClient.SendAsync(request);

            // 200 or 204 typically; if it fails we don’t want to block local cookie clearing
            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync();
                // Log and swallow OR throw; I’d recommend logging and swallow:
                // throw new HttpRequestException($"Supabase logout failed: {response.StatusCode} - {body}");
            }
        }



        public async Task ResetSupabasePasswordAsync(UserResetPasswordDto userResetPasswordDto, string supabaseId, string accessToken)
        {

           

            var req = new HttpRequestMessage(HttpMethod.Put, $"{_supabaseUrl.TrimEnd('/')}/auth/v1/user");
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            req.Headers.Add("apikey", _supabaseAnon);
            req.Content = JsonContent.Create(new { password = userResetPasswordDto.NewPassword });

            using var res = await _httpClient.SendAsync(req);
            var body = await res.Content.ReadAsStringAsync();
            if (!res.IsSuccessStatusCode)
                throw new InvalidOperationException($"Password update failed: {(int)res.StatusCode} - {body}");


        }

        public async Task ResetSupabasePasswordByIdAsync(UserResetPasswordByIdDto dto, string supabaseId)
        {
            if (dto is null) throw new ArgumentNullException(nameof(dto));
            if (string.IsNullOrWhiteSpace(supabaseId)) throw new ArgumentException("UserId is required.", nameof(dto));
            if (string.IsNullOrWhiteSpace(dto.NewPassword)) throw new ArgumentException("NewPassword is required.", nameof(dto));

            var url = $"{_supabaseUrl.TrimEnd('/')}/auth/v1/admin/users/{supabaseId}";

            using var req = new HttpRequestMessage(HttpMethod.Put, url);
            // Admin endpoint requires the SERVICE ROLE key as both Bearer and apikey
            req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _supabaseKey);
            req.Headers.Add("apikey", _supabaseKey);

            // Only fields you want to change; here: password
            req.Content = JsonContent.Create(new { password = dto.NewPassword });

            using var res = await _httpClient.SendAsync(req);
            var body = await res.Content.ReadAsStringAsync();

            if (!res.IsSuccessStatusCode)
            {
                throw new InvalidOperationException(
                    $"Admin password update failed: {(int)res.StatusCode} - {body}");
            }
        }


        public async Task AddNewRoleMetaData(string supabaseUserId,
        IEnumerable<string> roleNames,
        IEnumerable<string> businessNames)
        {
           
            {
                // Build payload that REPLACES the arrays in app_metadata
                var payload = new
                {
                    app_metadata = new
                    {
                        roles = roleNames?.Distinct().ToArray() ?? Array.Empty<string>(),
                        businesses = businessNames?.Distinct().ToArray() ?? Array.Empty<string>()
                    }
                };

                // (Optional) debug
                // Console.WriteLine($"[UpdateAuthUser] {JsonSerializer.Serialize(payload)}");

                var req = new HttpRequestMessage(
                    HttpMethod.Put,
                    $"{_supabaseUrl}/auth/v1/admin/users/{supabaseUserId}"
                );
                req.Headers.Add("apikey", _supabaseAnon);                  
                req.Headers.Add("Authorization", $"Bearer {_supabaseKey}");// service role key
                req.Content = JsonContent.Create(payload);

                var resp = await _httpClient.SendAsync(req);
                if (!resp.IsSuccessStatusCode)
                {
                    var body = await resp.Content.ReadAsStringAsync();
                    throw new Exception($"Supabase metadata update failed: {resp.StatusCode} - {body}");
                }
            }
        }

        public async Task HardDeleteAuthObject(string supabaseId)
        {
            var req = new HttpRequestMessage(
                  HttpMethod.Delete,
                  $"{_supabaseUrl}/auth/v1/admin/users/{supabaseId}"
              );
            req.Headers.Add("apikey", _supabaseAnon);
            req.Headers.Add("Authorization", $"Bearer {_supabaseKey}");// service role key

            var resp = await _httpClient.SendAsync(req);
            if (!resp.IsSuccessStatusCode)
            {
                var body = await resp.Content.ReadAsStringAsync();
                throw new Exception($"Supabase metadata update failed: {resp.StatusCode} - {body}");
            }
        }


    }
}
