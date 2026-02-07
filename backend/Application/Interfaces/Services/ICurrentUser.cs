using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    // Application
    public interface ICurrentUser
    {
        Guid? UserId { get; }
        string? SupabaseId { get; }
        bool IsAuthenticated { get; }  
    }

}
