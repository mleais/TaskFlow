using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;

namespace TaskFlow.Application.Features.SubTasks.Commands;

public record CreateSubTaskCommand(Guid IssueId, string Title) : IRequest<Result<SubTask>>;

public class CreateSubTaskCommandHandler : IRequestHandler<CreateSubTaskCommand, Result<SubTask>>
{
    private readonly ITaskFlowDbContext _context;

    public CreateSubTaskCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<SubTask>> Handle(CreateSubTaskCommand request, CancellationToken cancellationToken)
    {
        var subTask = new SubTask
        {
            Id = Guid.NewGuid(),
            Title = request.Title,
            IssueId = request.IssueId,
            IsCompleted = false,
            CreatedAt = DateTime.UtcNow
        };

        _context.SubTasks.Add(subTask);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<SubTask>.Success(subTask);
    }
}

public record ToggleSubTaskCommand(Guid SubTaskId) : IRequest<Result<bool>>;

public class ToggleSubTaskCommandHandler : IRequestHandler<ToggleSubTaskCommand, Result<bool>>
{
    private readonly ITaskFlowDbContext _context;

    public ToggleSubTaskCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<bool>> Handle(ToggleSubTaskCommand request, CancellationToken cancellationToken)
    {
        var subTask = await _context.SubTasks.FindAsync([request.SubTaskId], cancellationToken);
        if (subTask is null)
            return Result<bool>.Failure("Alt görev bulunamadı.");

        subTask.IsCompleted = !subTask.IsCompleted;
        subTask.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<bool>.Success(subTask.IsCompleted);
    }
}
