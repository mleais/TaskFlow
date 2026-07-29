using MediatR;
using TaskFlow.Application.Interfaces;
using TaskFlow.Core.Common;
using TaskFlow.Core.Entities;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Cryptography;
using System.Text;

namespace TaskFlow.Application.Features.Users.Commands;

public class InviteMemberCommandHandler : IRequestHandler<InviteMemberCommand, Result<string>>
{
    private readonly ITaskFlowDbContext _context;

    public InviteMemberCommandHandler(ITaskFlowDbContext context)
    {
        _context = context;
    }

    public async Task<Result<string>> Handle(InviteMemberCommand request, CancellationToken cancellationToken)
    {
        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (existingUser != null)
            return Result<string>.Failure("A user with this email already exists.");

        // Create a user with a random temp password
        var tempPassword = Guid.NewGuid().ToString("N").Substring(0, 10);
        
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(tempPassword));
        var hashString = BitConverter.ToString(hashedBytes).Replace("-", "").ToLower();

        var newUser = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.Email.Split('@')[0], // Use part of email as default name
            PasswordHash = hashString,
            IsActive = true
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync(cancellationToken);

        // In a real app, send email with tempPassword here.
        // For now, return a success message.
        return Result<string>.Success($"Successfully invited {request.Email}. Temp password is: {tempPassword}");
    }
}
