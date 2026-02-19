using Application.DTOs.SupabaseDto;
using Application.DTOs.UserDto;
using Application.DTOs.EmailVerificationDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace Application.Services
{
    public class UserService : IUserService
    {
        private readonly IBaseRepository<User> _userRepo;
        private readonly IBaseRepository<EmailVerification> _emailVerificationRepo;
        private readonly ISupabaseService _supabaseService;
        private readonly IMailgunService _mailgunService;

        public UserService(IBaseRepository<User> userRepo, IBaseRepository<EmailVerification> emailVerificationRepo, ISupabaseService supabaseService, IMailgunService mailgunService )
        {
            _userRepo = userRepo;
            _emailVerificationRepo = emailVerificationRepo;
            _supabaseService = supabaseService;
            _mailgunService = mailgunService;
        }

        //public async Task<User?> RegisterUser1(UserCreateDto userDto)
        //{
        //    var dbUserName = Guid.NewGuid();
        //    var supabaseUser = await _supabaseService.CreateAuthUserAsync(new SupabaseCreateUserDto
        //    {
        //        Email = userDto.Email,
        //        Password = userDto.Password,
        //        UserId = dbUserName,
        //    });

        //    var user = new User
        //    {
        //        Id = dbUserName,
        //        Email = userDto.Email,
        //        SupabaseId = supabaseUser.Id,
        //        CreatedAt = DateTime.UtcNow,
        //        IsDeleted = false

        //    };
        //    await _userRepo.Add(user);
        //    return user;
        //}

        public async Task<EmailVerificationResultDto> RegisterUser(UserCreateDto userDto)
        {

            // need logic here to check if both User.Email and supabaseUser.Email exists.
            var checkEmailExist = await _supabaseService.GetUserByEmailAsync(userDto.Email);
            if (checkEmailExist != null) 
            {
                var dbUser = await _userRepo
                .GetQueryable()
                .FirstOrDefaultAsync(v => v.SupabaseId == checkEmailExist.Id);
                if (dbUser != null)
                {
                    throw new Exception("A user with this email already exists");
                }

                await _supabaseService.DeleteUserByIdAsync(checkEmailExist.Id);

                //Check if emailVerification exists
                var checkEmailVerifcation = await _emailVerificationRepo
                    .GetQueryable()
                    .FirstOrDefaultAsync(u => u.Email == userDto.Email);

                if(checkEmailVerifcation != null)
                {
                    await _emailVerificationRepo.Delete(checkEmailVerifcation);
                }

            }

            var userId = Guid.NewGuid();

            var supabaseUser = await _supabaseService.CreateAuthUserAsync(
                new SupabaseCreateUserDto
                {
                    Email = userDto.Email,
                    Password = userDto.Password,
                    UserId = userId
                });
                
            // 1️⃣ Generate 6-digit verification code
            var verificationCode = RandomNumberGenerator
                    .GetInt32(100000, 999999)
                    .ToString(); ;

            // 2️⃣ Hash it using BCrypt
            var codeHash = BCrypt.Net.BCrypt.HashPassword(verificationCode);

            var emailVerification = new EmailVerification
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Email = userDto.Email,
                SupabaseId = supabaseUser.Id,
                CodeHash = codeHash,
                ExpiresAt = DateTime.UtcNow.AddMinutes(2),
                CreatedAt = DateTime.UtcNow,
                IsDeleted = false
            };

            await _emailVerificationRepo.Add(emailVerification);

            // 3️⃣ Send email
            await _mailgunService.SendVerificationEmail(
                userDto.Email,
                verificationCode
            );
      
            var result = new EmailVerificationResultDto
            {
                Id = emailVerification.Id,
            };


            return result;
        }

        public async Task<User?> VerifyEmail(EmailVerificationVerifyDto verifyDto)
        {

            var emailVerification = await _emailVerificationRepo.GetById(verifyDto.Id);

            if (emailVerification.ExpiresAt <= DateTime.UtcNow)
            {
                return null; // or return error: expired
            }


            var isValid = BCrypt.Net.BCrypt.Verify(
                  verifyDto.SubmitCode,
                  emailVerification.CodeHash
              );

            if (!isValid)
                return null;

            var user = new User
            {
                Id = emailVerification.UserId,
                Email = emailVerification.Email,
                SupabaseId = emailVerification.SupabaseId,
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
                throw new UnauthorizedAccessException("User not found in database");

          
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
