using System;

namespace TaskFlow.Core.Entities;

public class SubTask : BaseEntity
{
    public string Title { get; set; } = string.Empty;
    public bool IsCompleted { get; set; } = false;

    // Navigation
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
}
