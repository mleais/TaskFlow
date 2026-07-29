using System;

namespace TaskFlow.Core.Entities;

public enum RelationType
{
    Blocks = 0,
    BlockedBy = 1,
    DuplicateOf = 2,
    RelatesTo = 3
}

public class IssueRelation
{
    public Guid Id { get; set; }
    public Guid SourceIssueId { get; set; }
    public Issue SourceIssue { get; set; } = null!;
    
    public Guid TargetIssueId { get; set; }
    public Issue TargetIssue { get; set; } = null!;
    
    public RelationType Type { get; set; }
    public DateTime CreatedAt { get; set; }
}
