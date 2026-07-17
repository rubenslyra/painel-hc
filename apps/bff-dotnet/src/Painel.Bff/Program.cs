using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Painel.Application.Ports;
using Painel.Application.UseCases;
using Painel.Bff.Middlewares;
using Painel.Infrastructure.Audit;
using Painel.Infrastructure.Auth;
using Painel.Infrastructure.Erp;
using Painel.Infrastructure.Persistence;
using Refit;
using Serilog;

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// -------- Observabilidade --------
builder.Host.UseSerilog((ctx, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console(formatter: new Serilog.Formatting.Compact.CompactJsonFormatter()));

// -------- CORS (front Angular) --------
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:4200"])
    .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

// -------- Persistência --------
var conn = builder.Configuration.GetConnectionString("Painel");
builder.Services.AddDbContext<PainelDbContext>(o =>
{
    if (string.IsNullOrWhiteSpace(conn)) o.UseInMemoryDatabase("painel");
    else o.UseNpgsql(conn);
});

// -------- Refit (ERP externo) --------
builder.Services.AddRefitClient<IRmApi>()
    .ConfigureHttpClient(c => c.BaseAddress = new Uri(builder.Configuration["Erp:BaseUrl"] ?? "http://localhost:18082"));

// -------- Ports & Use Cases --------
builder.Services.AddScoped<IErpClient, RefitErpClient>();
builder.Services.AddScoped<IThresholdRepository, EfThresholdRepository>();
builder.Services.AddScoped<IAuditLog, DbAuditLog>();
builder.Services.AddScoped<ProjectQueries>();

// -------- JWT --------
var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>() ?? new JwtOptions();
if (string.IsNullOrWhiteSpace(jwt.Secret))
{
    jwt.Secret = "painel-hc-local-test-secret-32-bytes-minimum";
}

if (Encoding.UTF8.GetByteCount(jwt.Secret) < 32)
{
    jwt.Secret = Convert.ToBase64String(SHA256.HashData(Encoding.UTF8.GetBytes(jwt.Secret)));
}

builder.Services.AddSingleton(jwt);
builder.Services.AddSingleton<JwtService>();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o => o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = jwt.Issuer,
        ValidAudience = jwt.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
        ValidateIssuerSigningKey = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromSeconds(30)
    });
builder.Services.AddAuthorization();

// -------- Web --------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddHealthChecks();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PainelDbContext>();
    if (db.Database.IsRelational()) db.Database.EnsureCreated();
}

app.UseSerilogRequestLogging();
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseCors();
app.UseSwagger();
app.UseSwaggerUI();
app.UseAuthentication();
app.UseAuthorization();
app.MapHealthChecks("/health").AllowAnonymous();
app.MapControllers();

app.Run();

public partial class Program; // para WebApplicationFactory nos testes

