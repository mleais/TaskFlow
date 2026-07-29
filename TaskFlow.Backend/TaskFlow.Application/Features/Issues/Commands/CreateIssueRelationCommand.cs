using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Issues.Commands;

public record CreateIssueRelationCommand(Guid SourceIssueId, Guid TargetIssueId, RelationType Type) : IRequest<Result<IssueRelation>>;

public class CreateIssueRelationCommandHandler : IRequestHandler<CreateIssueRelationCommand, Result<IssueRelation>>
{
    private readonly ITaskFlowDbContext _context;

    public CreateIssueRelationCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IssueRelation>> Handle(CreateIssueRelationCommand request, CancellationToken cancellationToken)
    {
        var sourceIssue = await _context.Issues.FindAsync([request.SourceIssueId], cancellationToken);
        var targetIssue = await _context.Issues.FindAsync([request.TargetIssueId], cancellationToken);

        if (sourceIssue == null || targetIssue == null)
            return Result<IssueRelation>.Failure("Issue not found.");

        var relation = new IssueRelation
        {
            Id = Guid.NewGuid(),
            SourceIssueId = request.SourceIssueId,
            TargetIssueId = request.TargetIssueId,
            Type = request.Type,
            CreatedAt = DateTime.UtcNow
        };

        _context.IssueRelations.Add(relation);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<IssueRelation>.Success(relation);
    }
}
