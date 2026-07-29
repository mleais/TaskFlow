namespace TaskFlow.Core.Entities;

public enum IssueType
{
    Bug,
    Task,
    FeatureRequest
}

public enum IssueStatus
{
    Backlog,
    Todo,
    InProgress,
    InReview,
    Done
}

public enum RoleType
{
    CustomerObserver,
    Reporter,
    Developer,
    ProjectManager
}
