using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Users.Commands;

public class UpdateProfileCommandHandler : IRequestHandler<UpdateProfileCommand, Result<Unit>>
{
    private readonly ITaskFlowDbContext _context;

    public UpdateProfileCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Unit>> Handle(UpdateProfileCommand request, CancellationToken cancellationToken)
    {
        var user = await _context.Users.FindAsync(new object[] { request.UserId }, cancellationToken);
        if (user == null)
            return Result<Unit>.Failure("User not found.");

        user.FullName = request.FullName;

        await _context.SaveChangesAsync(cancellationToken);
        return Result<Unit>.Success(Unit.Value);
    }
}
