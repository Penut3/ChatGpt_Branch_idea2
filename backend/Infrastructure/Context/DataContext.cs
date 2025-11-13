using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class DataContext : DbContext

{

    public DbSet<User> Users { get; set; }

    public DbSet<Chat> Chats { get; set; }


    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        

        
        }


}