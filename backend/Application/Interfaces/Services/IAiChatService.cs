using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IAiChatService
    {
        Task<string> GetReplyAsync(string prompt);
    }
}
