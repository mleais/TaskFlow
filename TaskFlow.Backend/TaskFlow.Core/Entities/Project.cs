using System.Collections.Generic;

namespace TaskFlow.Core.Entities;

public class Project : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string ProjectKey { get; set; } = string.Empty; // e.g. ACB

    // Navigation
    public ICollection<UserProject> UserProjects { get; set; } = new List<UserProject>();
    public ICollection<Issue> Issues { get; set; } = new List<Issue>();
    public ICollection<Cycle> Cycles { get; set; } = new List<Cycle>();
}
