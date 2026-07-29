using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;

namespace TaskFlow.Application.Features.Issues.Commands;

public record UpdateIssueStatusCommand(Guid IssueId, IssueStatus NewStatus) : IRequest<Result<bool>>;

public class UpdateIssueStatusCommandHandler : IRequestHandler<UpdateIssueStatusCommand, Result<bool>>
{
    private readonly ITaskFlowDbContext _context;
    private readonly IIssueNotificationService _notificationService;

    public UpdateIssueStatusCommandHandler(ITaskFlowDbContext context, IIssueNotificationService notificationService)
    {
        _context = context;
        _notificationService = notificationService;
    }

    public async Task<Result<bool>> Handle(UpdateIssueStatusCommand request, CancellationToken cancellationToken)
    {
        var issue = await _context.Issues.FindAsync([request.IssueId], cancellationToken);
        if (issue is null)
            return Result<bool>.Failure("İş bulunamadı.");

        issue.Status = request.NewStatus;
        issue.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        await _notificationService.NotifyIssueUpdatedAsync(issue.Id, cancellationToken);

        return Result<bool>.Success(true);
    }
}
