using Application.DTOs.GridDto;
using Application.Interfaces.Repositories;
using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Text;

namespace Application.Services
{
    public class GridService : IGridService
    {
        private readonly IBaseRepository<Grid> _gridRepo;

        public GridService(IBaseRepository<Grid> gridRepo)
        {
            _gridRepo = gridRepo;
        }

        public async Task<IEnumerable <Grid>> GetGridAll()
        {
            return await _gridRepo.GetAll();
        }


        public async Task<Grid> CreateGrid(GridCreateDto gridCreateDto)
        {
            var grid = new Grid
            {
                Name = gridCreateDto.Name
            };
            await _gridRepo.Add(grid);
            return grid;
        }

    }
}
