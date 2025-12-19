using Application.DTOs.SupabaseDto;
using Application.DTOs.UserDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IBaseRepository<User> _userRepo;
        private readonly ISupabaseService _supabaseService;

        public UserService(IBaseRepository<User> userRepo, ISupabaseService supabaseService)
        {
            _userRepo = userRepo;
            _supabaseService = supabaseService;
        }

        public async Task<User?> RegisterUser(UserCreateDto userDto)
        {
            var dbUserName = Guid.NewGuid();
            var supabaseUser = await _supabaseService.CreateAuthUserAsync(new SupabaseCreateUserDto
            {
                Email = userDto.Email,
                Password = userDto.Password,
                UserId = dbUserName,
            });

            var user = new User
            {
                Id = dbUserName,
                Email = userDto.Email,
                SupabaseId = supabaseUser.Id,
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false

            };
            await _userRepo.Add(user);
            return user;
        }


        public async Task<UserLoginResultDto> LoginAsync(UserLoginDto loginDto)
        {
            var loginResponse = await _supabaseService.SupabaseLoginAsync(loginDto.Email, loginDto.Password);
            if (loginResponse == null)
                throw new UnauthorizedAccessException("Invalid email or password");

            var supabaseId = loginResponse.User?.Id;
            if (string.IsNullOrWhiteSpace(supabaseId))
                throw new UnauthorizedAccessException("Supabase user id missing in response");

            var user = await _userRepo.GetQueryable()
                .FirstOrDefaultAsync(u => u.SupabaseId == supabaseId && !u.IsDeleted);

            if (user == null)
                throw new UnauthorizedAccessException("User not found in local database");

          
            return new UserLoginResultDto
            {
                SupabaseId = supabaseId,
                SupabaseToken = loginResponse.AccessToken,
                RefreshToken = loginResponse.RefreshToken,
                ExpiresIn = loginResponse.ExpiresIn
            };
        }
    }
}
