using Application.DTOs.UserDto;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IUserService
    {
        Task<User?> RegisterUser(UserCreateDto userDto);
        Task<UserLoginResultDto> LoginAsync(UserLoginDto loginDto);
    }
}
