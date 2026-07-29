using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;

namespace TaskFlow.Application.Features.Comments.Commands;

public record CreateCommentCommand(Guid IssueId, Guid UserId, string Text) : IRequest<Result<Comment>>;

public class CreateCommentCommandHandler : IRequestHandler<CreateCommentCommand, Result<Comment>>
{
    private readonly ITaskFlowDbContext _context;

    public CreateCommentCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Comment>> Handle(CreateCommentCommand request, CancellationToken cancellationToken)
    {
        var comment = new Comment
        {
            Id = Guid.NewGuid(),
            IssueId = request.IssueId,
            UserId = request.UserId,
            Text = request.Text,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Comment>.Success(comment);
    }
}
