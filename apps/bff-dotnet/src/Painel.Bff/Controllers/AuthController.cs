using Microsoft.AspNetCore.Mvc;
using Painel.Application.Contracts;
using Painel.Infrastructure.Auth;

namespace Painel.Bff.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(JwtService jwt) : ControllerBase
{
    /// <summary>Login mock — em produção troque por validação contra IdP (LDAP, OIDC, etc).</summary>
    [HttpPost("login")]
    public ActionResult<AuthTokens> Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Username) || req.Password.Length < 4)
            return Unauthorized();
        return jwt.Issue(req.Username, ["viewer"]);
    }

    [HttpPost("refresh")]
    public ActionResult<AuthTokens> Refresh([FromBody] RefreshRequest req)
    {
        var t = jwt.Refresh(req.RefreshToken, ["viewer"]);
        return t is null ? Unauthorized() : t;
    }

    [HttpPost("logout")]
    public IActionResult Logout([FromBody] RefreshRequest req)
    {
        jwt.Revoke(req.RefreshToken);
        return NoContent();
    }
}
