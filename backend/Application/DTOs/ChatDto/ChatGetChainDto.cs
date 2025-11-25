using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ChatDto
{
    public class ChatGetChainDto
    {
        public Guid Id { get; set; }
        public string UserRequest { get; set; }
        public string ChatTitle { get; set; }
        public string Response { get; set; }
        public Guid? ParentChatId { get; set; }
        public Guid? RootChatId { get; set; }
        public double? ContextHealth { get; set; }

        public DateTime CreatedAt { get; set; }
}
}
