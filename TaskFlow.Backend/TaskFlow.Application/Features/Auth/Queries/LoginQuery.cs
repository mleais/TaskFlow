using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using System.Security.Cryptography;
using System.Text;

namespace TaskFlow.Application.Features.Auth.Queries;

public record LoginQuery(string Email, string Password) : IRequest<Result<LoginDto>>;

// Sadece kullanıcı doğrulama sonucunu döner, JWT üretimi API katmanında
public record LoginDto(Guid UserId, string FullName, string Email);

public class LoginQueryHandler : IRequestHandler<LoginQuery, Result<LoginDto>>
{
    private readonly ITaskFlowDbContext _context;

    public LoginQueryHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public Task<Result<LoginDto>> Handle(LoginQuery request, CancellationToken cancellationToken)
    {
        var hashedPassword = HashPassword(request.Password);
        var user = _context.Users.FirstOrDefault(u => u.Email == request.Email && u.PasswordHash == hashedPassword);

        if (user is null)
            return Task.FromResult(Result<LoginDto>.Failure("E-posta veya şifre hatalı."));

        var dto = new LoginDto(user.Id, user.FullName, user.Email);
        return Task.FromResult(Result<LoginDto>.Success(dto));
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }
}
