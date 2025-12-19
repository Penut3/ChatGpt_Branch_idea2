using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.ChatDto
{
    public sealed record ChatCreateDto
    {
        public string UserRequest { get; set; }

        public Guid? ParentChatId { get; set; }

        public Guid? GridId { get; set; }
    }
}
