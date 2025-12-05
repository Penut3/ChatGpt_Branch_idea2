using Application.DTOs.ChatDto;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IChatService
    {
        Task<Chat> CreateChat(ChatCreateDto chatCreateDto);
        Task<IEnumerable<Chat>> GetAllChats();

        Task<IEnumerable<ChatGetChainDto>> GetChatById(Guid id);
        Task<IEnumerable<ChatGetHeaderDto>> GetChatHeader();
        Task<IEnumerable<ChatGetHeaderDto>> GetChatHeaderLatest();

        Task<IEnumerable<ChatGetHeaderDto>> GetRootChats();

        Task<IEnumerable<Chat>> GetChatByRootId(Guid id);
        Task<IEnumerable<Chat>> GetChatsByGridId(Guid gridId);
    }
}
