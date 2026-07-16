using System.Net;
using System.Text.Json;

namespace Painel.Bff.Middlewares;

/// <summary>Converte exceções em respostas ProblemDetails consistentes e logáveis.</summary>
public sealed class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> log)
{
    public async Task Invoke(HttpContext ctx)
    {
        try { await next(ctx); }
        catch (Exception ex)
        {
            log.LogError(ex, "Unhandled exception on {Path}", ctx.Request.Path);
            ctx.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            ctx.Response.ContentType = "application/problem+json";
            await ctx.Response.WriteAsync(JsonSerializer.Serialize(new
            {
                type = "about:blank",
                title = "Erro inesperado",
                status = ctx.Response.StatusCode,
                traceId = ctx.TraceIdentifier
            }));
        }
    }
}
