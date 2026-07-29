using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading;
using System.Threading.Tasks;
using TaskFlow.Api.Hubs;
using TaskFlow.Application.Interfaces;

namespace TaskFlow.Api.Services;

public class SignalRIssueNotificationService : IIssueNotificationService
{
    private readonly IHubContext<TaskFlowHub> _hubContext;

    public SignalRIssueNotificationService(IHubContext<TaskFlowHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifyIssueCreatedAsync(Guid issueId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.All.SendAsync("IssueCreated", issueId, cancellationToken: cancellationToken);
    }

    public async Task NotifyIssueUpdatedAsync(Guid issueId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.All.SendAsync("IssueUpdated", issueId, cancellationToken: cancellationToken);
    }

    public async Task NotifyIssueDeletedAsync(Guid issueId, CancellationToken cancellationToken = default)
    {
        await _hubContext.Clients.All.SendAsync("IssueDeleted", issueId, cancellationToken: cancellationToken);
    }
}
