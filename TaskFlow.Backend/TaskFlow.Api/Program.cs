using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.IO;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using TaskFlow.Infrastructure.Data;
using TaskFlow.Application.Interfaces;
using TaskFlow.Application.Features.Issues.Queries;
using TaskFlow.Application.Features.Issues.Commands;
using TaskFlow.Application.Features.Auth.Commands;
using TaskFlow.Application.Features.Auth.Queries;
using TaskFlow.Application.Features.SubTasks.Commands;
using TaskFlow.Application.Features.Comments.Commands;
using TaskFlow.Application.Features.Attachments.Commands;
using TaskFlow.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Ignore JSON cycles for Minimal APIs
builder.Services.ConfigureHttpJsonOptions(options => 
{
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddSignalR();

// Configure MediatR - tüm assemblyleri tara
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(GetIssuesQuery).Assembly);
});

// Configure DbContext with PostgreSQL
builder.Services.AddDbContext<TaskFlowDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ITaskFlowDbContext>(provider => provider.GetRequiredService<TaskFlowDbContext>());
builder.Services.AddScoped<IIssueNotificationService, TaskFlow.Api.Services.SignalRIssueNotificationService>();

// Configure JWT Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key eksik. appsettings.json dosyasını kontrol edin.");
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });
builder.Services.AddAuthorization();

// Configure CORS for Vite frontend
// Geliştirmede: localhost:5173 | Canlıda: Render'da CORS_ORIGINS env variable'ı set et
var allowedOrigins = builder.Configuration["CorsOrigins"]
    ?? "http://localhost:5173,https://localhost:5173";

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins(allowedOrigins.Split(',', StringSplitOptions.RemoveEmptyEntries))
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials());
});

var app = builder.Build();

// Veritabanını otomatik olarak oluştur (Render'daki boş DB için)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<TaskFlow.Infrastructure.Data.TaskFlowDbContext>();
    db.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Dosya eklerinin indirilebilmesi için /uploads klasörünü dışa açıyoruz
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");
if (!Directory.Exists(uploadsPath)) Directory.CreateDirectory(uploadsPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});

app.UseAuthentication();
app.UseAuthorization();

// ─── SIGNALR ENDPOINTS ────────────────────────────────────────────────────────
app.MapHub<TaskFlow.Api.Hubs.TaskFlowHub>("/hubs/taskflow");

// ─── AUTH ENDPOINTS ───────────────────────────────────────────────────────────
var auth = app.MapGroup("/api/auth");

auth.MapPost("/register", async (IMediator mediator, [FromBody] RegisterCommand command) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Ok(new { userId = result.Value }) : Results.BadRequest(new { error = result.ErrorMessage });
});

auth.MapPost("/login", async (IMediator mediator, IConfiguration config, [FromBody] LoginQuery query) =>
{
    var result = await mediator.Send(query);
    if (!result.IsSuccess) return Results.Unauthorized();

    var dto = result.Value!;
    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, dto.UserId.ToString()),
        new Claim(ClaimTypes.Email, dto.Email),
        new Claim(ClaimTypes.Name, dto.FullName),
    };
    var token = new JwtSecurityToken(
        issuer: config["Jwt:Issuer"],
        audience: config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.UtcNow.AddDays(7),
        signingCredentials: creds
    );
    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Results.Ok(new { token = tokenString, fullName = dto.FullName, email = dto.Email, userId = dto.UserId });
});

// ─── PROJECTS ENDPOINTS ────────────────────────────────────────────────────────
var projects = app.MapGroup("/api/projects").RequireAuthorization();
projects.MapGet("/", async (IMediator mediator) =>
{
    var result = await mediator.Send(new TaskFlow.Application.Features.Projects.Queries.GetProjectsQuery());
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

// ─── CYCLES ENDPOINTS ──────────────────────────────────────────────────────────
var cycles = app.MapGroup("/api/cycles").RequireAuthorization();
cycles.MapGet("/", async (IMediator mediator) =>
{
    var result = await mediator.Send(new TaskFlow.Application.Features.Cycles.Queries.GetCyclesQuery());
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

// ─── USERS / MEMBERS ENDPOINTS ───────────────────────────────────────────────
var usersApi = app.MapGroup("/api/users").RequireAuthorization();
usersApi.MapGet("/", async (IMediator mediator) =>
{
    var result = await mediator.Send(new TaskFlow.Application.Features.Users.Queries.GetMembersQuery());
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

usersApi.MapPut("/me", async (IMediator mediator, HttpContext ctx, [FromBody] UpdateProfileRequest req) =>
{
    var userIdClaim = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null) return Results.Unauthorized();

    var cmd = new TaskFlow.Application.Features.Users.Commands.UpdateProfileCommand 
    { 
        UserId = userIdClaim, 
        FullName = req.FullName 
    };
    var result = await mediator.Send(cmd);
    return result.IsSuccess ? Results.Ok() : Results.BadRequest(new { error = result.ErrorMessage });
});

usersApi.MapPost("/me/avatar", async (IMediator mediator, HttpContext ctx, IFormFile file) =>
{
    var userIdClaim = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim == null) return Results.Unauthorized();

    using var stream = file.OpenReadStream();
    var cmd = new TaskFlow.Application.Features.Users.Commands.UploadAvatarCommand 
    { 
        UserId = userIdClaim, 
        FileStream = stream,
        FileName = file.FileName
    };
    var result = await mediator.Send(cmd);
    return result.IsSuccess ? Results.Ok(new { avatarUrl = result.Value }) : Results.BadRequest(new { error = result.ErrorMessage });
}).DisableAntiforgery();

usersApi.MapPost("/invite", async (IMediator mediator, [FromBody] InviteMemberRequest req) =>
{
    var cmd = new TaskFlow.Application.Features.Users.Commands.InviteMemberCommand { Email = req.Email };
    var result = await mediator.Send(cmd);
    return result.IsSuccess ? Results.Ok(new { message = result.Value }) : Results.BadRequest(new { error = result.ErrorMessage });
});

// ─── ISSUES ENDPOINTS ────────────────────────────────────────────────────────
var issues = app.MapGroup("/api/issues").RequireAuthorization();

issues.MapGet("/", async (IMediator mediator) =>
{
    var result = await mediator.Send(new GetIssuesQuery());
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

issues.MapGet("/{id:guid}", async (IMediator mediator, Guid id) =>
{
    var result = await mediator.Send(new GetIssueByIdQuery(id));
    return result.IsSuccess ? Results.Ok(result.Value) : Results.NotFound(new { error = result.ErrorMessage });
});

issues.MapPost("/", async (IMediator mediator, [FromBody] CreateIssueCommand command) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess
        ? Results.Created($"/api/issues/{result.Value?.Id}", result.Value)
        : Results.BadRequest(new { error = result.ErrorMessage });
});

issues.MapPatch("/{id:guid}/status", async (IMediator mediator, Guid id, [FromBody] UpdateStatusRequest req) =>
{
    var result = await mediator.Send(new UpdateIssueStatusCommand(id, (TaskFlow.Core.Entities.IssueStatus)req.Status));
    return result.IsSuccess ? Results.Ok() : Results.BadRequest(new { error = result.ErrorMessage });
});

issues.MapPatch("/{id:guid}/priority", async (IMediator mediator, Guid id, [FromBody] UpdatePriorityRequest req) =>
{
    var result = await mediator.Send(new UpdateIssuePriorityCommand(id, req.Priority));
    return result.IsSuccess ? Results.Ok() : Results.BadRequest(new { error = result.ErrorMessage });
});

issues.MapPost("/{id:guid}/effort", async (IMediator mediator, Guid id, [FromBody] LogEffortRequest req) =>
{
    var result = await mediator.Send(new LogEffortCommand(id, req.MinutesToLog));
    return result.IsSuccess ? Results.Ok() : Results.BadRequest(new { error = result.ErrorMessage });
});

issues.MapPost("/{id:guid}/relations", async (IMediator mediator, Guid id, [FromBody] CreateIssueRelationRequest req) =>
{
    var result = await mediator.Send(new CreateIssueRelationCommand(id, req.TargetIssueId, (TaskFlow.Core.Entities.RelationType)req.Type));
    return result.IsSuccess ? Results.Ok(result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

// ─── SUBTASKS ENDPOINTS ──────────────────────────────────────────────────────
var subtasks = app.MapGroup("/api/subtasks").RequireAuthorization();

subtasks.MapPost("/", async (IMediator mediator, [FromBody] CreateSubTaskCommand command) =>
{
    var result = await mediator.Send(command);
    return result.IsSuccess ? Results.Created($"/api/subtasks/{result.Value?.Id}", result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

subtasks.MapPatch("/{id:guid}/toggle", async (IMediator mediator, Guid id) =>
{
    var result = await mediator.Send(new ToggleSubTaskCommand(id));
    return result.IsSuccess ? Results.Ok(new { isCompleted = result.Value }) : Results.BadRequest(new { error = result.ErrorMessage });
});

// ─── COMMENTS ENDPOINTS ──────────────────────────────────────────────────────
var comments = app.MapGroup("/api/comments").RequireAuthorization();

comments.MapPost("/", async (IMediator mediator, HttpContext ctx, [FromBody] CreateCommentRequest req) =>
{
    var userIdClaim = ctx.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    if (userIdClaim is null) return Results.Unauthorized();
    var userId = Guid.Parse(userIdClaim);

    var result = await mediator.Send(new CreateCommentCommand(req.IssueId, userId, req.Text));
    return result.IsSuccess ? Results.Created($"/api/comments/{result.Value?.Id}", result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
});

// ─── ATTACHMENTS ENDPOINTS ───────────────────────────────────────────────────
var attachments = app.MapGroup("/api/attachments").RequireAuthorization();

attachments.MapPost("/", async (IMediator mediator, IWebHostEnvironment env, IFormFile file, [FromForm] Guid issueId) =>
{
    var uploadsDir = Path.Combine(env.ContentRootPath, "uploads");
    Directory.CreateDirectory(uploadsDir);

    var uniqueName = $"{Guid.NewGuid()}_{file.FileName}";
    var filePath = Path.Combine(uploadsDir, uniqueName);

    using (var stream = File.Create(filePath))
        await file.CopyToAsync(stream);

    var cmd = new UploadAttachmentCommand(issueId, file.FileName, $"/uploads/{uniqueName}", file.Length, file.ContentType);
    var result = await mediator.Send(cmd);
    return result.IsSuccess ? Results.Created($"/api/attachments/{result.Value?.Id}", result.Value) : Results.BadRequest(new { error = result.ErrorMessage });
}).DisableAntiforgery();

app.Run();

// ─── DTO RECORDS ─────────────────────────────────────────────────────────────
public record LoginRequest(string Email, string Password);
public record UpdateStatusRequest(int Status);
public record UpdatePriorityRequest(int Priority);
public record LogEffortRequest(int MinutesToLog);
public record UpdateProfileRequest(string FullName);
public record InviteMemberRequest(string Email);
record CreateCommentRequest(Guid IssueId, string Text);
public record CreateIssueRelationRequest(Guid TargetIssueId, int Type);
