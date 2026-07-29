using MediatR;
using TaskFlow.Core.Common;

namespace TaskFlow.Application.Features.Users.Commands;

public class UpdateProfileCommand : IRequest<Result<Unit>>
{
    public string UserId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
}
