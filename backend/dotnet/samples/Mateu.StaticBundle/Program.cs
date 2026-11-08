using System.Reflection;
using Mateu.AspNetCore;
using Mateu.Core.Bundle;
using Mateu.Uidl;

// `dotnet run -- bundle --ui <mateu-vaadin jar | static/> --out dist --static`: the HOSTED entry —
// the app exports itself, no web host is built. Without it, the app serves the same UI live.
if (args is ["bundle", ..]) return MateuBundle.Run(args[1..], Assembly.GetExecutingAssembly());

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddMateu(Assembly.GetExecutingAssembly());
var app = builder.Build();
app.MapMateu();
app.Run(Environment.GetEnvironmentVariable("MATEU_DEMO_URL") ?? "http://0.0.0.0:8599");
return 0;

namespace Mateu.StaticBundle
{
    [UI("/hello")]
    [Title("Hello from a static bundle")]
    [Subtitle("Pre-rendered by the .NET exporter")]
    public class Hello
    {
        public string Greeting { get; set; } = "No .NET server answered this page";
    }

    [UI("/about")]
    [Title("About")]
    public class About
    {
        public string What { get; set; } = "A Mateu UI exported by dotnet mateu-bundle";
    }

    [App(".NET static bundle")]
    public class StaticBundleApp
    {
        [MenuItem("Hello")] public Hello Hello() => new();
        [MenuItem("About")] public About About() => new();
    }
}
