using System;

namespace TaskFlow.Core.Entities;

public class Attachment : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public long FileSizeInBytes { get; set; }
    public string ContentType { get; set; } = string.Empty;

    // Navigation
    public Guid IssueId { get; set; }
    public Issue Issue { get; set; } = null!;
}
