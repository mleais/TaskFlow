$ErrorActionPreference = "Stop"

$baseUrl = "https://localhost:7143"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "Testing GET /api/issues..."
try {
    $issues = Invoke-RestMethod -Uri "$baseUrl/api/issues/" -Method Get
    Write-Host "Success! Found $($issues.Count) issues."
} catch {
    Write-Host "Failed to get issues: $_"
}

Write-Host "`nTesting POST /api/issues..."
$newIssue = @{
    title = "Test Issue from Script"
    description = "Testing if creation works smoothly"
    priority = 2
    type = "Task"
    projectKey = "TSK"
} | ConvertTo-Json
$createdIssueId = $null

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/issues/" -Method Post -Headers $headers -Body $newIssue -SkipCertificateCheck
    Write-Host "Success! Created issue with ID: $($response.id)"
    $createdIssueId = $response.id
} catch {
    Write-Host "Failed to create issue: $_"
}

if ($createdIssueId) {
    Write-Host "`nTesting PATCH /api/issues/$createdIssueId/status..."
    $statusPatch = @{ status = 1 } | ConvertTo-Json
    try {
        Invoke-RestMethod -Uri "$baseUrl/api/issues/$createdIssueId/status" -Method Patch -Headers $headers -Body $statusPatch -SkipCertificateCheck
        Write-Host "Success! Updated status."
    } catch {
        Write-Host "Failed to update status: $_"
    }

    Write-Host "`nTesting POST /api/subtasks/..."
    $subTask = @{ issueId = $createdIssueId; title = "Test Subtask" } | ConvertTo-Json
    try {
        $subTaskRes = Invoke-RestMethod -Uri "$baseUrl/api/subtasks/" -Method Post -Headers $headers -Body $subTask -SkipCertificateCheck
        Write-Host "Success! Created subtask."
    } catch {
        Write-Host "Failed to create subtask: $_"
    }
}
