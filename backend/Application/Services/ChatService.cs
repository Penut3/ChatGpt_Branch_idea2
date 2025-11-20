using Application.DTOs.ChatDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Text;
using static Application.Interfaces.Services.IAiChatService;

namespace Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IBaseRepository<Chat> _chatRepo;
        private readonly IAiChatService _aiChatService;
        private readonly ILogger<ChatService> _logger;

        public ChatService(IBaseRepository<Chat> chatRepo, IAiChatService aiChatService, ILogger<ChatService> logger)
        {
            _chatRepo = chatRepo;
            _aiChatService = aiChatService;
            _logger = logger;
        }
        
       public async Task<Chat> CreateChat(ChatCreateDto chatCreateDto)
        {
            _logger.LogInformation("➡️ CreateChat started. ParentChatId={ParentChatId}", chatCreateDto.ParentChatId);

            var messages = new List<AiMessage>
    {
        //new AiMessage { Role = AiMessageRole.System, Content = "You are a helpful assistant." }
    };

            _logger.LogInformation("🧱 Added system prompt message.");

            // Create chat chain
            if (chatCreateDto.ParentChatId.HasValue)
            {
                _logger.LogInformation("🔍 Fetching chat chain for parentId={ParentId}", chatCreateDto.ParentChatId.Value);

                var chain = await GetChatChainAsync(chatCreateDto.ParentChatId.Value);

                _logger.LogInformation("📚 Chain contains {Count} messages.", chain.Count);

                foreach (var chat in chain)
                {
                    _logger.LogInformation("📥 Adding past UserRequest: {Request}", chat.UserRequest);
                    messages.Add(new AiMessage
                    {
                        Role = AiMessageRole.User,
                        Content = chat.UserRequest
                    });

                    if (!string.IsNullOrWhiteSpace(chat.Response))
                    {
                        _logger.LogInformation("📤 Adding past Assistant response.");
                        messages.Add(new AiMessage
                        {
                            Role = AiMessageRole.Assistant,
                            Content = chat.Response
                        });
                    }
                }
            }

            // Add new user request
            _logger.LogInformation("➕ Adding new UserRequest: {UserRequest}", chatCreateDto.UserRequest);

            messages.Add(new AiMessage
            {
                Role = AiMessageRole.User,
                Content = chatCreateDto.UserRequest
            });

            _logger.LogInformation("🤖 Sending {Count} messages to AI model.", messages.Count);

            // Call AI service
            var aiResponse = await _aiChatService.GetReplyAsync(messages);

            _logger.LogInformation("🤖 AI responded with: {ResponsePreview}",
                aiResponse.Length > 50 ? aiResponse.Substring(0, 50) + "..." : aiResponse);

            // Create a title
            string chatTitle = aiResponse.Length > 20
                ? aiResponse.Substring(0, 20)
                : aiResponse;

            _logger.LogInformation("🏷 Generated chat title: {ChatTitle}", chatTitle);

            // Pre-generate ID
            var newChatId = Guid.NewGuid();
            Guid? rootChatId;

            if (!chatCreateDto.ParentChatId.HasValue)
            {
                _logger.LogInformation("🌱 No parent → this chat is the root. rootChatId={Id}", newChatId);
                rootChatId = newChatId;
            }
            else
            {
                var parentChat = await _chatRepo.GetById(chatCreateDto.ParentChatId.Value);
                rootChatId = parentChat.RootChatId ?? parentChat.Id;
                _logger.LogInformation("🌳 Parent found → rootChatId={RootId}", rootChatId);
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

            _logger.LogInformation("💾 Saving chat to database. ChatId={Id}, RootChatId={Root}", newChatId, rootChatId);

            await _chatRepo.Add(entity);

            _logger.LogInformation("✅ Chat successfully created. ChatId={Id}", newChatId);

            return entity;
        }





        private async Task<List<Chat>> GetChatChainAsync(Guid chatId)
        {
            var list = new List<Chat>();
            var visited = new HashSet<Guid>();
            var current = await _chatRepo.GetById(chatId);

            while (current != null && visited.Add(current.Id))
            {
                list.Insert(0, current);

                current = current.ParentChatId.HasValue
                    ? await _chatRepo.GetById(current.ParentChatId.Value)
                    : null;
            }

            // If current != null here, we detected a cycle
            // you could log a warning if you want

            return list;
        }


        public async Task<IEnumerable <Chat>> GetAllChats()
        {
            var res = await _chatRepo.GetAll();
            return res;
        }


        public async Task<IEnumerable<Chat>> GetChatById(Guid id)
        {
            var currentChat = await _chatRepo.GetById(id);

            if (currentChat == null)
            {
                // or throw NotFoundException/return null depending on how you handle 404s
                return Enumerable.Empty<Chat>();
            }

            if (!currentChat.ParentChatId.HasValue)
            {
                // No parent => just return this chat as a single-element collection
                return new[] { currentChat };
            }

            var chatChain = await GetChatChainAsync(id);
            return chatChain;
        }


    }
}
