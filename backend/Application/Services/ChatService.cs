using Application.DTOs.ChatDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Collections.Generic;
using System.Data;
using System.Text;
using static Application.Interfaces.Services.IAiChatService;

namespace Application.Services
{
    public class ChatService : IChatService
    {
        private readonly IBaseRepository<Chat> _chatRepo;
        private readonly IBaseRepository<ChatModel> _chatModelRepo;
        private readonly IAiChatService _aiChatService;
        private readonly ILogger<ChatService> _logger;

        public ChatService(IBaseRepository<Chat> chatRepo, IBaseRepository<ChatModel> chatModelRepo, IAiChatService aiChatService, ILogger<ChatService> logger)
        {
            _chatRepo = chatRepo;
            _chatModelRepo = chatModelRepo;
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

            //Get Model
            var testModelId = Guid.Parse("866993a1-ffda-4124-8d3e-b389ae3c06fc");
            var model = await _chatModelRepo.GetById(testModelId);
            var MaxContextWindowTokens = model.ContextWindowTokens;
            var MaxContextWindowCharacters = MaxContextWindowTokens * 4; // Rough estimate: 1 token ~ 4 characters

            _logger.LogInformation("MaxContextWindow Characters: ", MaxContextWindowCharacters);

            //Calculate total precentage of context window used
            var usedContextWindowCharacters = messages.Sum(m => m.Content?.Length ?? 0);
            _logger.LogInformation("used ContextWindow {UsedContextWindowCharacters}", usedContextWindowCharacters);

            var usedContextWindowPercentage =
            100.0 * usedContextWindowCharacters / MaxContextWindowCharacters;


            _logger.LogInformation("📊 Context window usage: {UsedPercentage}%", usedContextWindowPercentage);

            //Compare message to MaxContextWindowCharacters and trim if necessary
            if (usedContextWindowCharacters > MaxContextWindowCharacters)
            {
                _logger.LogWarning("⚠️ Messages exceed max context window. Trimming...");

                var totalChars = usedContextWindowCharacters;

                while (totalChars > MaxContextWindowCharacters)
                {
                    // remove oldest non-system message
                    var indexToRemove = messages.FindIndex(m => m.Role != AiMessageRole.System);

                    if (indexToRemove == -1)
                    {
                        _logger.LogWarning("🚫 Only system messages remain — cannot trim further.");
                        break;
                    }

                    _logger.LogWarning("🗑 Removing oldest message: {MsgType} '{Preview}'",
                        messages[indexToRemove].Role,
                        messages[indexToRemove].Content.Length > 50
                            ? messages[indexToRemove].Content.Substring(0, 50) + "..."
                            : messages[indexToRemove].Content);

                    messages.RemoveAt(indexToRemove);
                }

                _logger.LogInformation("✂️ Trimming complete. Final context size = {Chars} chars",
                    messages.Sum(m => m.Content.Length));
            }

            _logger.LogInformation("Preparing to send messages to AI: {Messages}",
    System.Text.Json.JsonSerializer.Serialize(messages));
            // Call AI service
            var aiResponse = await _aiChatService.GetReplyAsync(messages);

            _logger.LogInformation("response recived");

            _logger.LogInformation("🤖 AI responded with: {ResponsePreview}",
                aiResponse.Length > 50 ? aiResponse.Substring(0, 50) + "..." : aiResponse);

            // Create a title
            string chatTitle = aiResponse.Length > 35
                ? aiResponse.Substring(0, 35)
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
                ContextHealth = usedContextWindowPercentage,
                Createdby = null,
                CreatedAt = DateTime.UtcNow,
                ChatModelId = testModelId,
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
                if (!list.Any(c => c.Id == current.Id))
                {
                    list.Insert(0, current);
                }


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


        public async Task<IEnumerable<ChatGetChainDto>> GetChatById(Guid id)
        {
            var currentChat = await _chatRepo.GetById(id);

            if (currentChat == null)
            {
                // or throw NotFoundException/return null depending on how you handle 404s
                return Enumerable.Empty<ChatGetChainDto>();
            }

            var chatChain = await GetChatChainAsync(id);

            var list = new List<ChatGetChainDto>();
            foreach (var chat in chatChain)
            {
                var currentDtoObject = new ChatGetChainDto
                {
                    Id = chat.Id,
                    UserRequest = chat.UserRequest,
                    ChatTitle = chat.ChatTitle,
                    Response = chat.Response,
                    CreatedAt = chat.CreatedAt,
                    ParentChatId = chat.ParentChatId,
                    RootChatId = chat.RootChatId,
                    ContextHealth = chat.ContextHealth
                };

                list.Add(currentDtoObject);
            }
            return list;
        }







        public async Task<IEnumerable<ChatGetHeaderDto>> GetChatHeader()
        {
            var all = await _chatRepo.GetAll();

            return all.Select(chat => new ChatGetHeaderDto
            {
                Id = chat.Id,
                ChatTitle = chat.ChatTitle,
                CreatedAt = chat.CreatedAt,
                ParentChatId = chat.ParentChatId,
                RootChatId = chat.RootChatId,
                ContextHealth = chat.ContextHealth,
                UserRequest = chat.UserRequest.Length > 50
                ? chat.UserRequest.Substring(0, 50)
                : chat.UserRequest,
            });
        }


        public async Task<IEnumerable<ChatGetHeaderDto>> GetChatHeaderLatest()
        {
            var all = (await _chatRepo.GetAll()).ToList();

            // All chat IDs that are used as a parent (i.e. they HAVE children)
            var parentIds = new HashSet<Guid>(
                all.Where(c => c.ParentChatId.HasValue)
                   .Select(c => c.ParentChatId.Value)
            );

            // Leaf chats: those that are NOT a parent of any other chat
            var leafChats = all
                .Where(c => !parentIds.Contains(c.Id))
                .ToList();

            // Map to DTO and (optionally) sort by newest first
            var headers = leafChats
                .Select(chat => new ChatGetHeaderDto
                {
                    Id = chat.Id,
                    ChatTitle = chat.ChatTitle,
                    CreatedAt = chat.CreatedAt,
                    ParentChatId = chat.ParentChatId,
                    RootChatId = chat.RootChatId,
                    ContextHealth = chat.ContextHealth,
                    UserRequest = chat.UserRequest.Length > 50
                    ? chat.UserRequest.Substring(0, 50)
                    : chat.UserRequest,
                })
                .OrderByDescending(h => h.CreatedAt); // optional

            return headers;
        }

        public async Task<IEnumerable<Chat>> GetRootChats()
        {
            return await _chatRepo
                .GetQueryable()
                .Where(c => c.ParentChatId == null)
                .ToListAsync();
        }

        
             public async Task<IEnumerable<Chat>> GetChatByRootId(Guid id)
        {
            return await _chatRepo
                .GetQueryable()
                .Where(c => c.RootChatId == id)
                .ToListAsync();
        }
    }
}
