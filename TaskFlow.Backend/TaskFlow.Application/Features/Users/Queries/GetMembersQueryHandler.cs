using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Users.Queries;

public class GetMembersQueryHandler : IRequestHandler<GetMembersQuery, Result<IEnumerable<User>>>
{
    private readonly ITaskFlowDbContext _context;

    public GetMembersQueryHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<User>>> Handle(GetMembersQuery request, CancellationToken cancellationToken)
    {
        var users = await _context.Users
            .Include(u => u.AssignedIssues)
            .Include(u => u.UserProjects)
            .ThenInclude(up => up.Project)
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<User>>.Success(users);
    }
}
