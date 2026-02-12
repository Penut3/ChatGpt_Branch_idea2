using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Domain.Entities
{
    public class EmailVerification : BaseEntity
    {
        public Guid UserId { get; set; }
        public string SupabaseId { get; set; }
        public string Email {  get; set; }
        public string CodeHash { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
