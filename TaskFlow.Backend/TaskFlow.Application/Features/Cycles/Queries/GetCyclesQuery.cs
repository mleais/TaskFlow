using MediatR;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;

namespace TaskFlow.Application.Features.Cycles.Queries;

public class GetCyclesQuery : IRequest<Result<IEnumerable<Cycle>>>
{
}
