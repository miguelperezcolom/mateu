using System.Reflection;
using Mateu.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Discovers every [UI]/[App] class in this assembly.
builder.Services.AddMateu(Assembly.GetExecutingAssembly());

var app = builder.Build();

// Serves POST /mateu/v3/sync/{route}: the same wire the Java backends answer, so any Mateu renderer
// renders this app.
app.MapMateu();

app.Run(Environment.GetEnvironmentVariable("MATEU_URL") ?? "http://localhost:8080");
