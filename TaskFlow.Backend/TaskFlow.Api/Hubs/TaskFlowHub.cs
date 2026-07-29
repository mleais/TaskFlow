using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace TaskFlow.Api.Hubs;

public class TaskFlowHub : Hub
{
    // Clients will connect to this hub and receive broadcasted messages.
    // The backend commands will push events to connected clients via IHubContext<TaskFlowHub>.
}
