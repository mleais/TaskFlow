using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Security.Cryptography;
using System.Text;

namespace TaskFlow.Application.Features.Auth.Commands;

public record RegisterCommand(string FullName, string Email, string Password) : IRequest<Result<Guid>>;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Result<Guid>>
{
    private readonly ITaskFlowDbContext _context;

    public RegisterCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<Guid>> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existingUser = _context.Users.FirstOrDefault(u => u.Email == request.Email);
        if (existingUser is not null)
            return Result<Guid>.Failure("Bu e-posta adresi zaten kayıtlı.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = HashPassword(request.Password),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<Guid>.Success(user.Id);
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
