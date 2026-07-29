using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System;

namespace TaskFlow.Application.Features.Users.Commands;

public class UploadAvatarCommandHandler : IRequestHandler<UploadAvatarCommand, Result<string>>
{
    private readonly ITaskFlowDbContext _context;

    public UploadAvatarCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<string>> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
            return Result<string>.Failure("User not found.");

        if (request.FileStream == null)
            return Result<string>.Failure("No file uploaded.");

        // Create uploads directory if it doesn't exist
        var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "avatars");
        if (!Directory.Exists(uploadsFolder))
        {
            Directory.CreateDirectory(uploadsFolder);
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(request.FileName);
        var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";
        var filePath = Path.Combine(uploadsFolder, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.FileStream.CopyToAsync(stream, cancellationToken);
        }

        // Generate URL (assuming app runs at the root and wwwroot is served)
        var fileUrl = $"/avatars/{uniqueFileName}";
        
        user.AvatarUrl = fileUrl;
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(fileUrl);
    }
}
