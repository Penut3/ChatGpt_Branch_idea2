using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class Grid : BaseEntity
    {
        public string? Name { get; set; }
        public ICollection<Chat> Chats { get; set; } = new List<Chat>();
    }
}
