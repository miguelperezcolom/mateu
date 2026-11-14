using System.Reflection;
using Mateu.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Discovers every [UI]/[App] class in this assembly.
builder.Services.AddMateu(Assembly.GetExecutingAssembly());

var app = builder.Build();

// Serves POST /mateu/v3/sync/{route}: the same wire the Java backends answer, so any Mateu renderer
// renders this app. With MATEU_UI=<the io.mateu:mateu-vaadin jar, or its static/ folder> it also
// serves the web page at http://localhost:8080 (MapMateu(ui: "...") does the same).
app.MapMateu();

// Where it listens: `--urls` / ASPNETCORE_URLS (ASP.NET's own switch) win, then MATEU_URL, then :8080.
// Passing a url to Run() always overrode --urls, so `dotnet run --urls http://...:5000` was ignored.
app.Run(string.IsNullOrWhiteSpace(app.Configuration["urls"])
    ? Environment.GetEnvironmentVariable("MATEU_URL") ?? "http://localhost:8080"
    : null);
