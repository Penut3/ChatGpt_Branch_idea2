using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace Application.DTOs.EmailVerificationDto
{
    sealed public record EmailVerificationVerifyDto
    {
        [JsonPropertyName("id")]
        public Guid Id { get; set; }

        [JsonPropertyName("submitCode")]
        public string SubmitCode { get; set; }
    }
}
