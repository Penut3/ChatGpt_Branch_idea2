using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IAiChatService
    {
        //Task<string> GetReplyAsync(string prompt);
        public enum AiMessageRole
    {
        System,
        User,
        Assistant
    }
        Task<string> GetReplyAsync(IReadOnlyList<AiMessage> messages);

        public class AiMessage
    {
        public AiMessageRole Role { get; set; }
        public string Content { get; set; }
    }

    }
}
