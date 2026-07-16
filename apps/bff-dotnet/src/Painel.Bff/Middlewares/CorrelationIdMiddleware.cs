namespace Painel.Bff.Middlewares;

public sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string Header = "X-Correlation-Id";
    public async Task Invoke(HttpContext ctx)
    {
        var cid = ctx.Request.Headers[Header].FirstOrDefault() ?? Guid.NewGuid().ToString();
        ctx.Response.Headers[Header] = cid;
        using (Serilog.Context.LogContext.PushProperty("CorrelationId", cid))
            await next(ctx);
    }
}
