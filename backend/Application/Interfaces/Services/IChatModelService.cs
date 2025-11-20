using Application.DTOs.ChatModelDto;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Interfaces.Services
{
    public interface IChatModelService
    {
        Task<ChatModel> CreateChatModel(ChatModelCreateDto chatModelDto);
    }
}
