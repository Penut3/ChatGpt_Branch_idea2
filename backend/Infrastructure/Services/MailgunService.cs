using Application.DTOs.MailgunDto;
using Application.Interfaces.Services;
using RestSharp;
using RestSharp.Authenticators;
using System.Security;

namespace Infrastructure.Services
{
    public class MailgunService : IMailgunService
    {
        private readonly string _mailgunUrl;
        private readonly string _email;
        private readonly string _mailgunDomain;
        private readonly string _mailgunApiKey;
        private readonly RestClient _client;

        public MailgunService() {
            _mailgunUrl = Environment.GetEnvironmentVariable("MAILGUN_URL");
            _email = Environment.GetEnvironmentVariable("EMAIL");
            _mailgunDomain = Environment.GetEnvironmentVariable("MAILGUN_DOMAIN");
            _mailgunApiKey = Environment.GetEnvironmentVariable("MAILGUN_API_KEY");

            var options = new RestClientOptions($"{_mailgunUrl}")
            {
                Authenticator = new HttpBasicAuthenticator(
                 "api", $"{_mailgunApiKey}"

               )
            };
            _client = new RestClient(options);

        }

   

        public async Task<MailgunResultDto> SendAsync()
        {

            var request = new RestRequest($"/v3/{_mailgunDomain}/messages", Method.Post);
            request.AlwaysMultipartFormData = true;
            request.AddParameter("from", $"Mailgun Sandbox <postmaster@{_mailgunDomain}>");
            request.AddParameter("to", $"S J <{_email}>");
            request.AddParameter("subject", "Hello S J");
            request.AddParameter("text", "Congratulations S J, you just sent an email with Mailgun! You are truly awesome!");

            var response = await _client.ExecuteAsync(request);

            return new MailgunResultDto
            {
                IsSuccess = response.IsSuccessful,
                StatusCode = (int)response.StatusCode,
                Message = response.Content
            };
        }


        public async Task<MailgunResultDto> VerifyEmail(string verificationCode)
        {
            var request = new RestRequest($"/v3/{_mailgunDomain}/messages", Method.Post);
            request.AlwaysMultipartFormData = true;
            request.AddParameter("from", $"Mailgun Sandbox <postmaster@{_mailgunDomain}>");
            request.AddParameter("to", $"S J <{_email}>");
            request.AddParameter("subject", "Verfication code");
            request.AddParameter("text", "Your verification code: ");

            var response = await _client.ExecuteAsync(request);

            return new MailgunResultDto
            {
                IsSuccess = response.IsSuccessful,
                StatusCode = (int)response.StatusCode,
                Message = response.Content
            };
        }

    }
}
