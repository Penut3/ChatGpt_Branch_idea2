using Application.Interfaces.Services;
using Domain.Entities;
using Microsoft.EntityFrameworkCore;

public class DataContext : DbContext
{
    private readonly Guid? _currentUserId;

    public DataContext(DbContextOptions<DataContext> options, ICurrentUser currentUser)
        : base(options)
    {
        _currentUserId = currentUser.UserId;
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Chat> Chats { get; set; }
    public DbSet<ChatModel> ChatModels { get; set; }
    public DbSet<Grid> Grids { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Tree
        modelBuilder.Entity<Chat>()
            .HasOne(c => c.ParentChat)
            .WithMany(c => c.ChildChats)
            .HasForeignKey(c => c.ParentChatId)
            .OnDelete(DeleteBehavior.Cascade);

        // Index
        modelBuilder.Entity<Chat>()
            .HasIndex(c => c.Createdby)
            .HasDatabaseName("IX_Chat_CreatedBy");

        // Grid 1 -> many chats
        modelBuilder.Entity<Grid>()
            .HasMany(g => g.Chats)
            .WithOne(c => c.Grid)
            .HasForeignKey(c => c.GridId)
            .OnDelete(DeleteBehavior.Restrict);

        // ✅ Global query filter
        modelBuilder.Entity<Chat>()
            .HasQueryFilter(c => !_currentUserId.HasValue || c.Createdby == _currentUserId);
    }
}
