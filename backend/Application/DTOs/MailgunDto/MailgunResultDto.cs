using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.MailgunDto
{
    public class MailgunResultDto
    {
        public bool IsSuccess { get; init; }
        public int StatusCode { get; init; }
        public string? Message { get; init; }
    }
}
