using System.Reflection;
using System.Runtime.Loader;

// dotnet mateu-bundle [--app <App.dll>] --ui <renderer> [--out dist] [--static] …
//
// Loads the BUILT app (its assembly and the dependencies its deps.json names, Mateu.Core among
// them) into a context of its own and calls Mateu.Core.Bundle.MateuBundle.Run of the app's own
// Mateu.Core over the app's assembly. Nothing of the app runs: its Program is not executed, no host
// is built — the exporter scans its [UI]/[App] types and renders every route in process.
//
// Without --app it looks for the project in the current directory and takes the newest
// bin/**/<Project>.dll (build first: `dotnet build`).

var arguments = args.ToList();
string? app = null;
var at = arguments.IndexOf("--app");
if (at >= 0 && at + 1 < arguments.Count)
{
    app = arguments[at + 1];
    arguments.RemoveRange(at, 2);
}
if (arguments.Contains("--help") || arguments.Contains("-h"))
{
    Console.WriteLine("dotnet mateu-bundle [--app <App.dll>] --ui <renderer> [options]  (--help after --app for every option)");
    if (app is null) return 0;
}
app ??= FindBuiltApp(Directory.GetCurrentDirectory());
if (app is null || !File.Exists(app))
{
    Console.Error.WriteLine("mateu-bundle: no app to bundle. Build it (dotnet build) and run this in its project"
                            + " directory, or pass --app <path to the app's .dll>.");
    return 2;
}
app = Path.GetFullPath(app);
var context = new AppLoadContext(app);
var appAssembly = context.LoadFromAssemblyPath(app);
Assembly core;
try
{
    core = context.LoadFromAssemblyName(new AssemblyName("Mateu.Core"));
}
catch (Exception)
{
    Console.Error.WriteLine($"mateu-bundle: {Path.GetFileName(app)} does not reference Mateu.Core — is it a Mateu app?");
    return 2;
}
var run = core.GetType("Mateu.Core.Bundle.MateuBundle")?.GetMethod("Run", [typeof(string[]), typeof(Assembly[])]);
if (run is null)
{
    Console.Error.WriteLine($"mateu-bundle: the app's Mateu.Core ({core.GetName().Version}) has no bundle exporter;"
                            + " update the Mateu packages to the version of this tool.");
    return 2;
}
try
{
    return (int)run.Invoke(null, [arguments.ToArray(), new[] { appAssembly }])!;
}
catch (TargetInvocationException e) when (e.InnerException is { } inner)
{
    Console.Error.WriteLine("mateu-bundle failed: " + inner);
    return 1;
}

static string? FindBuiltApp(string dir)
{
    var project = Directory.GetFiles(dir, "*.csproj").FirstOrDefault();
    if (project is null) return null;
    var name = Path.GetFileNameWithoutExtension(project);
    var bin = Path.Combine(dir, "bin");
    if (!Directory.Exists(bin)) return null;
    return Directory.GetFiles(bin, name + ".dll", SearchOption.AllDirectories)
        .Where(f => !f.Contains($"{Path.DirectorySeparatorChar}ref{Path.DirectorySeparatorChar}"))
        .OrderByDescending(File.GetLastWriteTimeUtc)
        .FirstOrDefault();
}

/// <summary>The app's own dependency graph (its deps.json): its Mateu.Core, Mateu.Uidl, YamlDotNet…
/// The shared frameworks (Microsoft.NETCore.App, Microsoft.AspNetCore.App) come from the default
/// context, which this tool's runtimeconfig loads.</summary>
internal sealed class AppLoadContext(string mainAssembly) : AssemblyLoadContext("mateu-app", isCollectible: false)
{
    private readonly AssemblyDependencyResolver _resolver = new(mainAssembly);

    // what the app's deps.json names loads from the app; anything else (the shared frameworks) falls
    // back to the default context
    protected override Assembly? Load(AssemblyName name) =>
        _resolver.ResolveAssemblyToPath(name) is { } path ? LoadFromAssemblyPath(path) : null;

    protected override IntPtr LoadUnmanagedDll(string unmanagedDllName) =>
        _resolver.ResolveUnmanagedDllToPath(unmanagedDllName) is { } path ? LoadUnmanagedDllFromPath(path) : IntPtr.Zero;
}
