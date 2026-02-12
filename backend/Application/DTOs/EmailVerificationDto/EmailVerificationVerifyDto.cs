using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.EmailVerificationDto
{
    sealed public record EmailVerificationVerifyDto
    {
        public Guid Id { get; set; }
        public string SubmitCode { get; set; }
    }
}
