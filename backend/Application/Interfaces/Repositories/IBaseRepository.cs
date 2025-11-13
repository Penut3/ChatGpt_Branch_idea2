using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Application.Interfaces.Repositories { 

public interface IBaseRepository<T> where T : class
{
    IQueryable<T> GetQueryable();
    Task Add(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    Task<IEnumerable<T>> GetAll();
    Task<T?> GetById(Guid id);
    Task Update(T entity);
    Task Delete(T entity);
    Task DeleteRange(IEnumerable<T> entities);
    Task SaveChanges();
}
}