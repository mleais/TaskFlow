using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Issues.Commands;

public record UpdateIssuePriorityCommand(Guid IssueId, int Priority) : IRequest<Result<bool>>;

public class UpdateIssuePriorityCommandHandler : IRequestHandler<UpdateIssuePriorityCommand, Result<bool>>
{
    private readonly ITaskFlowDbContext _context;

    public UpdateIssuePriorityCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateIssuePriorityCommand request, CancellationToken cancellationToken)
    {
        var issue = await _context.Issues.FindAsync(new object[] { request.IssueId }, cancellationToken);
        if (issue == null)
            return Result<bool>.Failure("Görev bulunamadı.");

        issue.Priority = (TaskFlow.Core.Enums.Priority)request.Priority;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
