using Application.DTOs.GridDto;
using Application.Interfaces.Services;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        private readonly IMailgunService _mailgunService;

        public TestController(IMailgunService mailgunService)
        {
            _mailgunService = mailgunService;
        }

        [HttpGet("Mailgun Test")]
        public async Task<IActionResult> SendTestEmail()
        {
            var res = await _mailgunService.SendAsync();
            return Ok(res);
        }

    }
}
