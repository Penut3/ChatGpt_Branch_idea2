using Application.DTOs.GridDto;
using Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GridController : ControllerBase
    {
        private readonly IGridService _gridService;

        public GridController(IGridService gridService  )
        {
            _gridService = gridService; 
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetGridAll()
        {
            var res = await _gridService.GetGridAll();
            return Ok(res);
        }

        [HttpPost("CreateGrid")]
        public async Task<IActionResult> CreateGrid([FromBody] GridCreateDto gridCreateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var res = await _gridService.CreateGrid(gridCreateDto);
            return Ok(res);
        }
    }
}
