using Application.DTOs.ChatDto;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private readonly IChatService _chatService;

        public ChatController(IChatService chatService)
        {
            _chatService = chatService;
        }

        [HttpPost("CreateChat")]
        public async Task<IActionResult> CreateChat([FromBody] ChatCreateDto chatCreateDto) 
        {
            var res = await _chatService.CreateChat(chatCreateDto);
            return Ok(res);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetChats()
        {
            var res = await _chatService.GetAllChats();
            return Ok(res);
        }

        [HttpGet("{id:Guid}")]
        public async Task<IActionResult> GetChatById(Guid id)
        {
            var res = await _chatService.GetChatById(id);
            return Ok(res);
        }


        [HttpGet("ChatHeaders/Latest")]
        public async Task<IActionResult> GetChatHeaderlatest()
        {
            var res = await _chatService.GetChatHeaderLatest();
            return Ok(res);
        }

        [HttpGet("ChatHeaders")]
        public async Task<IActionResult> GetChatHeader()
        {
            var res = await _chatService.GetChatHeader();
            return Ok(res);
        }
    }
}
