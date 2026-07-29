using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;

namespace TaskFlow.Application.Features.Issues.Queries;

public record GetIssueByIdQuery(Guid IssueId) : IRequest<Result<Issue>>;

public class GetIssueByIdQueryHandler : IRequestHandler<GetIssueByIdQuery, Result<Issue>>
{
    private readonly ITaskFlowDbContext _context;

    public GetIssueByIdQueryHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Issue>> Handle(GetIssueByIdQuery request, CancellationToken cancellationToken)
    {
        var issue = await _context.Issues
            .Include(i => i.Assignee)
            .Include(i => i.Project)
            .Include(i => i.SubTasks)
            .Include(i => i.Comments).ThenInclude(c => c.User)
            .Include(i => i.Attachments)
            .Include(i => i.SourceRelations)
            .Include(i => i.TargetRelations)
            .FirstOrDefaultAsync(i => i.Id == request.IssueId, cancellationToken);

        if (issue is null)
            return Result<Issue>.Failure("İş bulunamadı.");

        return Result<Issue>.Success(issue);
    }
}
