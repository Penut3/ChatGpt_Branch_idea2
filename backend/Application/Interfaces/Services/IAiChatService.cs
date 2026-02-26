using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IAiChatService
    {
        //Task<string> GetReplyAsync(string prompt);
        enum AiMessageRole
        {
            System,
            User,
            Assistant
        }
        class AiMessage
        {
            public AiMessageRole Role { get; set; }
            public string Content { get; set; }
        }

        IAsyncEnumerable<string> GetReplyAsync(List<AiMessage> messages, [EnumeratorCancellation] CancellationToken ct = default);



    }
}
