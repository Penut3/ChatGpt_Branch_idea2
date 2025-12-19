using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.DTOs.UserDto
{
    public sealed record UserCreateDto
    {
        public string Email { get; init; } = null!;
        public string Password { get; init; } = null!;
    }
}
