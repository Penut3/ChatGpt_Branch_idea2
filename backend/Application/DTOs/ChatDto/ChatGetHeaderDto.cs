using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ChatDto
{
    public sealed record ChatGetHeaderDto
    {
        public Guid Id { get; set; }
        public string ChatTitle { get; set; }
        public Guid? ParentChatId { get; set; }
        public Guid? RootChatId { get; set; }
        public double? ContextUsed { get; set; }

        public string UserRequest { get; set; }

        public DateTime CreatedAt { get; set; }
        public Guid? GridId { get; set; }
    }
}
