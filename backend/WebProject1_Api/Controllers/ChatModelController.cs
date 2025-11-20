using Application.DTOs.ChatModelDto;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatModelController : ControllerBase
    {
        private readonly IChatModelService _chatModelService;

        public ChatModelController(IChatModelService chatModelService)
        {
            _chatModelService = chatModelService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateChat([FromBody] ChatModelCreateDto chatModelCreateDto)
        {
            var res = await _chatModelService.CreateChatModel(chatModelCreateDto);
            return Ok(res); // or CreatedAtAction(...) if you have a GetById
        }

        //[HttpGet("all")]
        //public async Task<IActionResult> GetChats()
        //{
        //    var res = await _chatService.GetAllChats();
        //    return Ok(res);
        //}
    }
}
