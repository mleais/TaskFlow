using System;

namespace TaskFlow.Core.Entities;

public class UserProject
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;

    public RoleType Role { get; set; }
}
