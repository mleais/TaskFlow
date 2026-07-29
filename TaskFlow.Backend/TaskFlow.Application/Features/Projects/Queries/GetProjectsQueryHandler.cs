using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Projects.Queries;

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, Result<IEnumerable<Project>>>
{
    private readonly ITaskFlowDbContext _context;

    public GetProjectsQueryHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<Project>>> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        var projects = await _context.Projects
            .Include(p => p.Issues)
            .Include(p => p.Cycles)
            .Include(p => p.UserProjects)
            .ThenInclude(up => up.User)
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<Project>>.Success(projects);
    }
}
