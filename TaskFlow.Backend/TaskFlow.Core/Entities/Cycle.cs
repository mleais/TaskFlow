using System;
using System.Collections.Generic;

namespace TaskFlow.Core.Entities;

public class Cycle : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }

    // Navigation
    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public ICollection<Issue> Issues { get; set; } = new List<Issue>();
}
