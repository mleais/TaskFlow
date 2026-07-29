using MediatR;
using TaskFlow.Core.Common;

namespace TaskFlow.Application.Features.Users.Commands;

public class InviteMemberCommand : IRequest<Result<string>>
{
    public string Email { get; set; } = string.Empty;
}
