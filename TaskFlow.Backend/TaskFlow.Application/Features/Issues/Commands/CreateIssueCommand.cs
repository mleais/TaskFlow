using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Threading;
using System.Threading.Tasks;

using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace TaskFlow.Application.Features.Issues.Commands;

public record CreateIssueCommand(string Title, string Description, int Priority, string Type, string ProjectKey) : IRequest<Result<Issue>>;

public class CreateIssueCommandHandler : IRequestHandler<CreateIssueCommand, Result<Issue>>
{
    private readonly ITaskFlowDbContext _context;

    public CreateIssueCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Issue>> Handle(CreateIssueCommand request, CancellationToken cancellationToken)
    {
        var maxIssueNumber = await _context.Issues
            .Where(i => i.ProjectKey == request.ProjectKey)
            .MaxAsync(i => (int?)i.IssueNumber, cancellationToken) ?? 0;

        var issueType = request.Type switch
        {
            "Bug" => IssueType.Bug,
            "Task" => IssueType.Task,
            _ => IssueType.FeatureRequest
        };

        var issue = new Issue
        {
            Title = request.Title,
            Description = request.Description,
            Status = IssueStatus.Todo,
            Priority = (TaskFlow.Core.Enums.Priority)request.Priority,
            ProjectKey = request.ProjectKey,
            IssueNumber = maxIssueNumber + 1,
            Type = issueType,
            CreatedAt = System.DateTime.UtcNow
        };

        var project = await _context.Projects.FirstOrDefaultAsync(p => p.ProjectKey == request.ProjectKey, cancellationToken);
        if (project == null)
        {
            project = new TaskFlow.Core.Entities.Project
            {
                Id = System.Guid.NewGuid(),
                Name = "Default Project",
                ProjectKey = request.ProjectKey
            };
            _context.Projects.Add(project);
            await _context.SaveChangesAsync(cancellationToken);
        }

        issue.ProjectId = project.Id;

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Issue>.Success(issue);
    }
}
