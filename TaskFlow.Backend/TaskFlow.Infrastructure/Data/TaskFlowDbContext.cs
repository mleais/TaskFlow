using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Entities;

namespace TaskFlow.Infrastructure.Data;

public class TaskFlowDbContext : DbContext, ITaskFlowDbContext
{
    public TaskFlowDbContext(DbContextOptions<TaskFlowDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Project> Projects { get; set; } = null!;
    public DbSet<UserProject> UserProjects { get; set; } = null!;
    public DbSet<Issue> Issues { get; set; } = null!;
    public DbSet<Comment> Comments { get; set; } = null!;
    public DbSet<SubTask> SubTasks { get; set; } = null!;
    public DbSet<Attachment> Attachments { get; set; } = null!;
    public DbSet<Cycle> Cycles { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // UserProject Many-to-Many
        modelBuilder.Entity<UserProject>()
            .HasKey(up => new { up.UserId, up.ProjectId });

        modelBuilder.Entity<UserProject>()
            .HasOne(up => up.User)
            .WithMany(u => u.UserProjects)
            .HasForeignKey(up => up.UserId);

        modelBuilder.Entity<UserProject>()
            .HasOne(up => up.Project)
            .WithMany(p => p.UserProjects)
            .HasForeignKey(up => up.ProjectId);

        // Issue - Project relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Project)
            .WithMany(p => p.Issues)
            .HasForeignKey(i => i.ProjectId);

        // Issue - Cycle relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Cycle)
            .WithMany(c => c.Issues)
            .HasForeignKey(i => i.CycleId)
            .IsRequired(false);

        // Cycle - Project relationship
        modelBuilder.Entity<Cycle>()
            .HasOne(c => c.Project)
            .WithMany(p => p.Cycles)
            .HasForeignKey(c => c.ProjectId);

        // Issue - Assignee relationship
        modelBuilder.Entity<Issue>()
            .HasOne(i => i.Assignee)
            .WithMany(u => u.AssignedIssues)
            .HasForeignKey(i => i.AssigneeId)
            .IsRequired(false);

        // Comment - Issue relationship
        modelBuilder.Entity<Comment>()
            .HasOne(c => c.Issue)
            .WithMany(i => i.Comments)
            .HasForeignKey(c => c.IssueId);

        // SubTask - Issue relationship
        modelBuilder.Entity<SubTask>()
            .HasOne(st => st.Issue)
            .WithMany(i => i.SubTasks)
            .HasForeignKey(st => st.IssueId);

        // Attachment - Issue relationship
        modelBuilder.Entity<Attachment>()
            .HasOne(a => a.Issue)
            .WithMany(i => i.Attachments)
            .HasForeignKey(a => a.IssueId);
    }
}
