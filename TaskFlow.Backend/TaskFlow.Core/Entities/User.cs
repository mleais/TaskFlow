using System.Collections.Generic;

namespace TaskFlow.Core.Entities;

public class User : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = false;

    // Navigation
    public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
    public ICollection<Issue> AssignedIssues { get; set; } = new List<Issue>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}
