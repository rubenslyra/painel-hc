using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Painel.Application.Contracts;

namespace Painel.Infrastructure.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "painel-bff";
    public string Audience { get; set; } = "painel-web";
    public string Secret { get; set; } = "";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}

/// <summary>
/// Serviço mínimo de emissão/renovação de JWT. Refresh tokens ficam em memória para o mock;
/// em produção use tabela dedicada (rotativa) com hash + revogação.
/// </summary>
public sealed class JwtService(JwtOptions opts)
{
    private readonly Dictionary<string, string> _refreshToUser = new(); // refresh -> userId

    public AuthTokens Issue(string userId, IEnumerable<string> roles)
    {
        var expires = DateTime.UtcNow.AddMinutes(opts.AccessTokenMinutes);
        var claims = new List<Claim> { new(JwtRegisteredClaimNames.Sub, userId), new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.Secret));
        var token = new JwtSecurityToken(opts.Issuer, opts.Audience, claims, expires: expires,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        var access = new JwtSecurityTokenHandler().WriteToken(token);
        var refresh = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
        _refreshToUser[refresh] = userId;
        return new AuthTokens(access, refresh, new DateTimeOffset(expires, TimeSpan.Zero));
    }

    public AuthTokens? Refresh(string refreshToken, IEnumerable<string> roles)
    {
        if (!_refreshToUser.Remove(refreshToken, out var userId)) return null;
        return Issue(userId, roles);
    }

    public void Revoke(string refreshToken) => _refreshToUser.Remove(refreshToken);
}
