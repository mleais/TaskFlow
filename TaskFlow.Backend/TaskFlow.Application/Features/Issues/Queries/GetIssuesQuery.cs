using MediatR;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;

namespace TaskFlow.Application.Features.Issues.Queries;

public class GetIssuesQuery : IRequest<Result<IEnumerable<Issue>>>
{
}
