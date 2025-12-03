using Application.DTOs.GridDto;
using Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Application.Interfaces.Services
{
    public interface IGridService
    {
        Task<IEnumerable<Grid>> GetGridAll();
        Task<Grid> CreateGrid(GridCreateDto gridCreateDto);
    }
}
