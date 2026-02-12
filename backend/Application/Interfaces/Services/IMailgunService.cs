using Application.DTOs.MailgunDto;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IMailgunService
    {
        Task<MailgunResultDto> SendAsync();

        Task<MailgunResultDto> SendVerificationEmail(string email, string verificationCode);
    }
}
