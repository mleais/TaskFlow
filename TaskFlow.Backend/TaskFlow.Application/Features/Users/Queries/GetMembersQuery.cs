using MediatR;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Collections.Generic;

namespace TaskFlow.Application.Features.Users.Queries;

public class GetMembersQuery : IRequest<Result<IEnumerable<User>>>
{
}
