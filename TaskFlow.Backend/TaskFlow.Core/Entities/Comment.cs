using System;

namespace TaskFlow.Core.Entities;

public class Comment : BaseEntity
{
    public string Text { get; set; } = string.Empty;

    // Navigation
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;
}
