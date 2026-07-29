using MediatR;
using Microsoft.EntityFrameworkCore;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Features.Cycles.Queries;

public class GetCyclesQueryHandler : IRequestHandler<GetCyclesQuery, Result<IEnumerable<Cycle>>>
{
    private readonly ITaskFlowDbContext _context;

    public GetCyclesQueryHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<IEnumerable<Cycle>>> Handle(GetCyclesQuery request, CancellationToken cancellationToken)
    {
        var cycles = await _context.Cycles
            .Include(c => c.Issues)
            .Include(c => c.Project)
            .ToListAsync(cancellationToken);

        return Result<IEnumerable<Cycle>>.Success(cycles);
    }
}
