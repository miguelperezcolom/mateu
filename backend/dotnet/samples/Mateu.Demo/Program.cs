using System.Reflection;
using Mateu.AspNetCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMateu(Assembly.GetExecutingAssembly());
builder.Services.AddCors(o => o.AddDefaultPolicy(p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();
app.MapMateu();

// Bind to all interfaces so native clients (iOS simulator → localhost, Android emulator → 10.0.2.2) reach it.
app.Run(Environment.GetEnvironmentVariable("MATEU_DEMO_URL") ?? "http://0.0.0.0:8593");
