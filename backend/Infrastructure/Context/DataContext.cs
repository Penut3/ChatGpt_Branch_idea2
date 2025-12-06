using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class DataContext : DbContext
{
    public DbSet<User> Users { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<ChatModel> ChatModels { get; set; }
    public DbSet<Grid> Grids { get; set; }


    public DataContext(DbContextOptions<DataContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tree
        modelBuilder.Entity<Chat>()
            .HasOne(c => c.ParentChat)
            .WithMany(c => c.ChildChats)
            .HasForeignKey(c => c.ParentChatId)
            .OnDelete(DeleteBehavior.Cascade);

        // Grid 1 -> many chats
        modelBuilder.Entity<Grid>()
            .HasMany(g => g.Chats)
            .WithOne(c => c.Grid)
            .HasForeignKey(c => c.GridId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
