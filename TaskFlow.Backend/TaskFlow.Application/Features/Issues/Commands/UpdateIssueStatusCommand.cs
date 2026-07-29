using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;

namespace TaskFlow.Application.Features.Issues.Commands;

public record UpdateIssueStatusCommand(Guid IssueId, IssueStatus NewStatus) : IRequest<Result<bool>>;

public class UpdateIssueStatusCommandHandler : IRequestHandler<UpdateIssueStatusCommand, Result<bool>>
{
    private readonly ITaskFlowDbContext _context;

    public UpdateIssueStatusCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(UpdateIssueStatusCommand request, CancellationToken cancellationToken)
    {
        var issue = await _context.Issues.FindAsync([request.IssueId], cancellationToken);
        if (issue is null)
            return Result<bool>.Failure("İş bulunamadı.");

        issue.Status = request.NewStatus;
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(true);
    }
}
