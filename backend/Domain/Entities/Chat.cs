using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Chat : BaseEntity
    {
        public string UserRequest { get; set; }
        public string? ChatTitle { get; set; } // generated title name from ai or first words of UserRequest

        public string Response { get; set; }

        public Guid? Createdby { get; set; } // User from JWT

        public double? ContextUsed { get; set; } //Will be set after the request to OpenAi api. And is calculated by the whole chat context length.

        public Guid? RootChatId { get; set; }
        public Guid? GridId { get; set; }
        public Grid? Grid { get; set; }
        public Guid? ParentChatId { get; set; } //If null this act as the root of the tree.
        public Chat? ParentChat { get; set; }

        public Guid? ChatModelId { get; set; }
        public ChatModel? ChatModel { get; set; }

        public ICollection<Chat?> ChildChats { get; set; }
    }
}
