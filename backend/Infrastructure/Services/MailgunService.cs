using Application.DTOs.MailgunDto;
using Application.Interfaces.Services;
using RestSharp;
using RestSharp.Authenticators;

namespace Infrastructure.Services
{
    public class MailgunService : IMailgunService
    {
        private readonly string _mailgunUrl;
        private readonly string _email;

        public MailgunService() {
            _mailgunUrl = Environment.GetEnvironmentVariable("MAILGUN_URL");
            _email = Environment.GetEnvironmentVariable("EMAIL");
        }

        public async Task<MailgunResultDto> SendAsync()
        {
            var options = new RestClientOptions("https://api.mailgun.net")
            {
                Authenticator = new HttpBasicAuthenticator(
                    "api",
                    Environment.GetEnvironmentVariable("MAILGUN_API_KEY")
                )
            };

            var client = new RestClient(options);


            //var request = new RestRequest(
            //    $"/v3/{_mailgunUrl}/messages",
            //    Method.Post
            //);

            var request = new RestRequest("/v3/sandbox77b6cd64d51845daa1feb57e7d81349a.mailgun.org/messages", Method.Post);

            request.AlwaysMultipartFormData = true;
            request.AddParameter(
                 "from",
                 "Mailgun Sandbox <postmaster@sandbox77b6cd64d51845daa1feb57e7d81349a.mailgun.org>"
             );
            request.AddParameter("to", $"S J <{_email}>");
            request.AddParameter("subject", "Hello S J");
            request.AddParameter("text", "Congratulations...");

            var response = await client.ExecuteAsync(request);

            return new MailgunResultDto
            {
                IsSuccess = response.IsSuccessful,
                StatusCode = (int)response.StatusCode,
                Message = response.Content
            };
        }
    }
}
