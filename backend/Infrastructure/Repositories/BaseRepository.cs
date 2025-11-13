using Application.Interfaces.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Infrastructure.Repositories;

public class BaseRepository<T> : IBaseRepository<T> where T : class
{
    private readonly DataContext _context;

    public virtual IQueryable<T> GetQueryable() => _context.Set<T>();


    public BaseRepository(DataContext context)
    {
        _context = context;
    }

    public async Task Add(T entity)
    {
        await _context.Set<T>().AddAsync(entity);
        await SaveChanges();
    }

    public async Task AddRangeAsync(IEnumerable<T> entities)
    {
        await _context.Set<T>().AddRangeAsync(entities);
        await SaveChanges();
    }

    public async Task<IEnumerable<T>> GetAll()
    {
        return await _context.Set<T>().ToListAsync();
    }

    public async Task<T?> GetById(Guid id)
    {
        return await _context.Set<T>().FindAsync(id);
    }

    public async Task Update(T entity)
    {
        _context.Entry(entity).State = EntityState.Modified;
        await SaveChanges();
    }

    public async Task Delete(T entity)
    {
        _context.Set<T>().Remove(entity);
        await SaveChanges();
    }
    public async Task DeleteRange(IEnumerable<T> entities)
    {
        _context.Set<T>().RemoveRange(entities);
        await SaveChanges();
    }

    public async Task SaveChanges()
    {
        await _context.SaveChangesAsync();
    }
}
