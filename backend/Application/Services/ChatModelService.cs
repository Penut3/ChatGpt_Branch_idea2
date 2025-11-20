using Application.DTOs.ChatModelDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Text;

namespace Application.Services
{
    public class ChatModelService : IChatModelService
    {
        private readonly IBaseRepository<ChatModel> _chatModelRepo;

        public ChatModelService(IBaseRepository<ChatModel> chatModelRepo)
        {
            _chatModelRepo = chatModelRepo;
        }

        public async Task<ChatModel> CreateChatModel(ChatModelCreateDto chatModelDto)
        {
            var entity = new ChatModel
            {
                Name = chatModelDto.Name,
                ContextWindowTokens = chatModelDto.ContextWindowTokens,
                MaxOutputTokens = chatModelDto.MaxOutputTokens
            };

            await _chatModelRepo.Add(entity);  // just await, no var res
            return entity;                     // return the entity you built
        }


    }
}
