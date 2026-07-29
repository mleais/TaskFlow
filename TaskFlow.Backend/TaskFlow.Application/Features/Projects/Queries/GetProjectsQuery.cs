using MediatR;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;

namespace TaskFlow.Application.Features.Projects.Queries;

public class GetProjectsQuery : IRequest<Result<IEnumerable<Project>>>
{
}
