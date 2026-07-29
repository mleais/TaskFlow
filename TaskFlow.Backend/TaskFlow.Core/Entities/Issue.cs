using System;
using System.Collections.Generic;

namespace TaskFlow.Core.Entities;

public class Issue : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ProjectKey { get; set; } = string.Empty;
    public int IssueNumber { get; set; }
    public IssueType Type { get; set; }
    public IssueStatus Status { get; set; } = IssueStatus.Backlog;
    public TaskFlow.Core.Enums.Priority Priority { get; set; } = TaskFlow.Core.Enums.Priority.NoPriority;
    public DateTime? DueDate { get; set; }
    
    // Effort Tracking
    public int EstimatedTimeInMinutes { get; set; }
    public int LoggedTimeInMinutes { get; set; }

    // Navigation
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public Guid? AssigneeId { get; set; }
    public User? Assignee { get; set; }

    public Guid? CycleId { get; set; }
    public Cycle? Cycle { get; set; }

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
    public ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
}
