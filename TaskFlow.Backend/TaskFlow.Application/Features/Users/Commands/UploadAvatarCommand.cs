using MediatR;
using System.IO;
using TaskFlow.Core.Common;

namespace TaskFlow.Application.Features.Users.Commands;

public class UploadAvatarCommand : IRequest<Result<string>>
{
    public string UserId { get; set; } = string.Empty;
    public Stream FileStream { get; set; } = null!;
    public string FileName { get; set; } = string.Empty;
}
