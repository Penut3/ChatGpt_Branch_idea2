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

        public ChatService(IBaseRepository<Chat> chatRepo)
        {
            _chatRepo = chatRepo;
        }

        public async Task<Chat> CreateChat(ChatCreateDto chatCreateDto)
        {
            if (chatCreateDto == null)
                throw new ArgumentNullException(nameof(chatCreateDto));

            var chat= new Chat
            {
                Id = Guid.NewGuid(),
                ChatTitle = "test chat title",
                UserRequest = chatCreateDto.UserRequest,
                ParentChatId = chatCreateDto.ParentChatId,
                Response = "Test response", // Response from ai
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
