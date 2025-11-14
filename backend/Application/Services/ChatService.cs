using Application.DTOs.ChatDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using System.Data;

namespace Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IBaseRepository<Chat> _chatRepo;
        private readonly IAiChatService _aiChatService;

        public ChatService(IBaseRepository<Chat> chatRepo, IAiChatService aiChatService)
        {
            _chatRepo = chatRepo;
            _aiChatService = aiChatService;
        }

        public async Task<Chat> CreateChat(ChatCreateDto chatCreateDto)
        {
            var aiResponse = await _aiChatService.GetReplyAsync(chatCreateDto.UserRequest);
            var chat= new Chat
            {
                Id = Guid.NewGuid(),
                ChatTitle = "test chat title",
                UserRequest = chatCreateDto.UserRequest,
                ParentChatId = chatCreateDto.ParentChatId,
                Response = aiResponse,
                ContextHealth = 100,
                Createdby = null,
                CreatedAt = DateTime.UtcNow
            };

            await _chatRepo.Add(chat);
            return chat;
        }


        public async Task<IEnumerable <Chat>> GetAllChats()
        {
            var res = await _chatRepo.GetAll();
            return res;
        }


    }
}
