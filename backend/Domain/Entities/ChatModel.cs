using System;
using System.Collections.Generic;
using System.Text;

namespace Domain.Entities
{
    public class ChatModel : BaseEntity
    {
        public string Name { get; set; }

        public int ContextWindowTokens { get; set; }  // Example: 128000

        public int MaxOutputTokens { get; set; }
    }
}
