using System;
using System.Threading;
using System.Threading.Tasks;

namespace TaskFlow.Application.Interfaces;

public interface IIssueNotificationService
{
    Task NotifyIssueCreatedAsync(Guid issueId, CancellationToken cancellationToken = default);
    Task NotifyIssueUpdatedAsync(Guid issueId, CancellationToken cancellationToken = default);
    Task NotifyIssueDeletedAsync(Guid issueId, CancellationToken cancellationToken = default);
}
