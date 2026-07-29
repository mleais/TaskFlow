using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Issues.Commands;

public record CreateIssueCommand(string Title, string Description, int Status, string ProjectKey, int IssueNumber) : IRequest<Result<Issue>>;

public class CreateIssueCommandHandler : IRequestHandler<CreateIssueCommand, Result<Issue>>
{
    private readonly ITaskFlowDbContext _context;

    public CreateIssueCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Issue>> Handle(CreateIssueCommand request, CancellationToken cancellationToken)
    {
        var issue = new Issue
        {
            Title = request.Title,
            Description = request.Description,
            Status = (IssueStatus)request.Status,
            ProjectKey = request.ProjectKey,
            IssueNumber = request.IssueNumber,
            CreatedAt = System.DateTime.UtcNow
        };

        _context.Issues.Add(issue);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Issue>.Success(issue);
    }
}
