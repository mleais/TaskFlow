using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;

namespace TaskFlow.Application.Features.Issues.Commands;

public record LogEffortCommand(Guid IssueId, int MinutesToLog) : IRequest<Result<bool>>;

public class LogEffortCommandHandler : IRequestHandler<LogEffortCommand, Result<bool>>
{
    private readonly ITaskFlowDbContext _context;

    public LogEffortCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(LogEffortCommand request, CancellationToken cancellationToken)
    {
        var issue = await _context.Issues.FindAsync([request.IssueId], cancellationToken);
        if (issue is null)
            return Result<bool>.Failure("İş bulunamadı.");

        issue.LoggedTimeInMinutes += request.MinutesToLog;
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
