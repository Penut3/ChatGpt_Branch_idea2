using Application.DTOs.ChatDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Text;
using static Application.Interfaces.Services.IAiChatService;

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
            var messages = new List<AiMessage>
    {
        new AiMessage { Role = AiMessageRole.System, Content = "You are a helpful assistant." }
    };

            // Create chat chain
            if (chatCreateDto.ParentChatId.HasValue)
            {
                var chain = await GetChatChainAsync(chatCreateDto.ParentChatId.Value);

                foreach (var chat in chain)
                {
                    messages.Add(new AiMessage
                    {
                        Role = AiMessageRole.User,
                        Content = chat.UserRequest
                    });

                    if (!string.IsNullOrWhiteSpace(chat.Response))
                    {
                        messages.Add(new AiMessage
                        {
                            Role = AiMessageRole.Assistant,
                            Content = chat.Response
                        });
                    }
                }
            }

            // Add new userRequest to request
            messages.Add(new AiMessage
            {
                Role = AiMessageRole.User,
                Content = chatCreateDto.UserRequest
            });

            var aiResponse = await _aiChatService.GetReplyAsync(messages);

            // Get the first 20 characters or the full response if shorter for ChatTitle
            string chatTitle = aiResponse.Length > 20
                ? aiResponse.Substring(0, 20)
                : aiResponse;

            // Pre-generate the new chat Id so we can use it as root when needed
            var newChatId = Guid.NewGuid();

            // Figure out RootChatId
            Guid? rootChatId;

            if (!chatCreateDto.ParentChatId.HasValue)
            {
                // This is the first chat in the thread → it is the root
                rootChatId = newChatId;
            }
            else
            {
                var parentChat = await _chatRepo.GetById(chatCreateDto.ParentChatId.Value);

                // If parent already has a root, reuse it; otherwise the parent *is* the root
                rootChatId = parentChat.RootChatId ?? parentChat.Id;
            }

            var entity = new Chat
            {
                Id = newChatId,
                ChatTitle = chatTitle,
                UserRequest = chatCreateDto.UserRequest,
                RootChatId = rootChatId,
                ParentChatId = chatCreateDto.ParentChatId,
                Response = aiResponse,
                ContextHealth = 100,
                Createdby = null,
                CreatedAt = DateTime.UtcNow
            };

            await _chatRepo.Add(entity);
            return entity;
        }




        private async Task<List<Chat>> GetChatChainAsync(Guid chatId)
        {
            var list = new List<Chat>();
            var current = await _chatRepo.GetById(chatId);

            while (current != null)
            {
                list.Insert(0, current); // add oldest first
                current = current.ParentChatId.HasValue
                    ? await _chatRepo.GetById(current.ParentChatId.Value)
                    : null;
            }

            return list;
        }



        public async Task<IEnumerable <Chat>> GetAllChats()
        {
            var res = await _chatRepo.GetAll();
            return res;
        }


    }
}
