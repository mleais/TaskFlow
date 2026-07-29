using Microsoft.EntityFrameworkCore;
using TaskFlow.Core.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Interfaces;

public interface ITaskFlowDbContext
{
    DbSet<User> Users { get; set; }
    DbSet<Project> Projects { get; set; }
    DbSet<UserProject> UserProjects { get; set; }
    DbSet<Issue> Issues { get; set; }
    DbSet<SubTask> SubTasks { get; set; }
    DbSet<Comment> Comments { get; set; }
    DbSet<Attachment> Attachments { get; set; }
    DbSet<Cycle> Cycles { get; set; }
    DbSet<IssueRelation> IssueRelations { get; set; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
