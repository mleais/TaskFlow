using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Issues.Queries;

public class GetIssuesQueryHandler : IRequestHandler<GetIssuesQuery, Result<IEnumerable<Issue>>>
{
    private readonly ITaskFlowDbContext _context;

    public GetIssuesQueryHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<Issue>>> Handle(GetIssuesQuery request, CancellationToken cancellationToken)
    {
        var issues = await _context.Issues
            .Include(i => i.Assignee)
            .Include(i => i.Project)
            .Include(i => i.SubTasks)
            .Include(i => i.Comments).ThenInclude(c => c.User)
            .Include(i => i.Attachments)
            .Include(i => i.SourceRelations)
            .Include(i => i.TargetRelations)
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<Issue>>.Success(issues);
    }
}
