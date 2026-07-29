using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;

namespace TaskFlow.Application.Features.Attachments.Commands;

public record UploadAttachmentCommand(Guid IssueId, string FileName, string FilePath, long FileSizeInBytes, string ContentType) : IRequest<Result<Attachment>>;

public class UploadAttachmentCommandHandler : IRequestHandler<UploadAttachmentCommand, Result<Attachment>>
{
    private readonly ITaskFlowDbContext _context;

    public UploadAttachmentCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Attachment>> Handle(UploadAttachmentCommand request, CancellationToken cancellationToken)
    {
        var attachment = new Attachment
        {
            Id = Guid.NewGuid(),
            IssueId = request.IssueId,
            FileName = request.FileName,
            FilePath = request.FilePath,
            FileSizeInBytes = request.FileSizeInBytes,
            ContentType = request.ContentType,
            CreatedAt = DateTime.UtcNow
        };

        _context.Attachments.Add(attachment);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Attachment>.Success(attachment);
    }
}
