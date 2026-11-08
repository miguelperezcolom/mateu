using System.Reflection;

namespace Mateu.Core.Bundle;

/// <summary>
/// Exports a Mateu.NET app to a STATIC BUNDLE — the .NET twin of <c>mvn mateu-bundle:bundle</c> and
/// <c>python -m mateu_ui.bundle</c>. Every route is rendered IN PROCESS through the port's own sync
/// handler (no server is started) into the same <c>manifest.json</c> + static site Java writes.
///
/// Two front doors, one implementation:
/// <list type="bullet">
/// <item><c>dotnet mateu-bundle</c> (the <c>Mateu.Bundle</c> tool) loads the app's built assembly
/// and calls <see cref="Run(string[], Assembly[])"/> on the app's OWN Mateu.Core, so the exporter always matches the
/// version the app runs;</item>
/// <item>from the app itself: <c>if (args is ["bundle", ..]) return MateuBundle.Run(args[1..],
/// typeof(Program).Assembly);</c> before building the web host.</item>
/// </list>
/// </summary>
public static class MateuBundle
{
    /// <summary>The usage text (<c>--help</c>).</summary>
    public const string Usage =
        """
        dotnet mateu-bundle [--app <App.dll>] --ui <mateu-vaadin jar | its static/ folder> [options]

          --out <dir>              output directory (default: mateu-bundle)
          --specs <dir>            the specs/ui directory (default: MATEU_SPECS_DIR or ./specs/ui)
          --base-url <path>        the path the bundle is served under ("" = a host root)
          --title <text>           the page title (default: Mateu)
          --static                 the bundle must run with NO backend: fail when anything needs a server
          --specs-only             ship browser-expandable definition-only routes RAW
          --include-param-routes   bundle :param routes as templates (default: skipped)
          --environment <name>     the type: Environment the REST sources point at
          --mock                   ship the sources' sample data and answer from it
          --route <route>          export exactly these routes (repeatable)
          --no-pwa                 do not ship the bundle as an installable app
          --fail-on-empty          fail when no route rendered
          --fail-on-skipped        fail when any route could not be bundled
          -q, --quiet              only report what went wrong
        """;

    /// <summary>Runs the exporter over the views of <paramref name="assemblies"/> with the
    /// command-line <paramref name="args"/>. Returns the exit status: 0 = bundle written; 1 =
    /// <c>--static</c> and something still needs a server (the report is printed), or
    /// <c>--fail-on-empty</c>/<c>--fail-on-skipped</c>; 2 = bad arguments.</summary>
    public static int Run(string[] args, params Assembly[] assemblies) =>
        Run(args, Console.Out, Console.Error, assemblies);

    internal static int Run(string[] args, TextWriter stdout, TextWriter stderr, params Assembly[] assemblies)
    {
        var options = new Options();
        for (var i = 0; i < args.Length; i++)
        {
            string Next() => i + 1 < args.Length ? args[++i] : throw new ArgumentException($"{args[i]} needs a value");
            try
            {
                switch (args[i])
                {
                    case "--out": options.Out = Next(); break;
                    case "--ui": options.Ui = Next(); break;
                    case "--specs": options.Specs = Next(); break;
                    case "--base-url": options.BaseUrl = Next(); break;
                    case "--title": options.Title = Next(); break;
                    case "--static": options.StaticOnly = true; break;
                    case "--specs-only": options.SpecsOnly = true; break;
                    case "--include-param-routes": options.IncludeParamRoutes = true; break;
                    case "--environment": options.Environment = Next(); break;
                    case "--mock": options.Mock = true; break;
                    case "--route": options.Routes.Add(Next()); break;
                    case "--no-pwa": options.Pwa = false; break;
                    case "--fail-on-empty": options.FailOnEmpty = true; break;
                    case "--fail-on-skipped": options.FailOnSkipped = true; break;
                    case "-q" or "--quiet": options.Quiet = true; break;
                    case "--app": Next(); break; // read by the launcher (the tool), which loaded it
                    case "-h" or "--help": stdout.WriteLine(Usage); return 0;
                    default:
                        stderr.WriteLine($"mateu-bundle: unknown option {args[i]}\n{Usage}");
                        return 2;
                }
            }
            catch (ArgumentException e)
            {
                stderr.WriteLine("mateu-bundle: " + e.Message);
                return 2;
            }
        }
        return Export(options, stdout, stderr, assemblies);
    }

    internal sealed class Options
    {
        public string Out { get; set; } = "mateu-bundle";
        public string? Ui { get; set; } = System.Environment.GetEnvironmentVariable(UiPage.EnvVar);
        public string? Specs { get; set; }
        public string BaseUrl { get; set; } = "";
        public string Title { get; set; } = "Mateu";
        public bool StaticOnly { get; set; }
        public bool SpecsOnly { get; set; }
        public bool IncludeParamRoutes { get; set; }
        public string? Environment { get; set; }
        public bool Mock { get; set; }
        public List<string> Routes { get; } = [];
        public bool Pwa { get; set; } = true;
        public bool FailOnEmpty { get; set; }
        public bool FailOnSkipped { get; set; }
        public bool Quiet { get; set; }
    }

    internal static int Export(Options o, TextWriter stdout, TextWriter stderr, Assembly[] assemblies)
    {
        void Info(string line)
        {
            if (!o.Quiet) stdout.WriteLine(line);
        }
        if (string.IsNullOrWhiteSpace(o.Ui))
        {
            stderr.WriteLine("mateu-bundle: no renderer. Pass --ui <io.mateu:mateu-vaadin jar or its static/ folder>"
                             + " (or set MATEU_UI).");
            return 2;
        }
        RendererFiles renderer;
        try
        {
            renderer = RendererFiles.At(o.Ui);
        }
        catch (FileNotFoundException e)
        {
            stderr.WriteLine("mateu-bundle: " + e.Message);
            return 2;
        }
        var specs = Path.GetFullPath(o.Specs ?? System.Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
            ?? Path.Combine("specs", "ui"));
        var registry = new MateuRegistry(assemblies);
        var handler = new SyncHandler(registry, specsDir: specs,
            restSources: new RestSourceRegistry(registry, specs, o.Environment));
        var exporter = new BundleExporter(handler, specs);
        var manifest = o.Routes.Count > 0
            ? exporter.Export(o.BaseUrl, o.Routes)
            : exporter.ExportAll(o.BaseUrl, staticOnly: true, includeParamRoutes: o.IncludeParamRoutes,
                specsOnly: o.SpecsOnly, mock: o.Mock, environment: o.Environment);
        BundleWriter.Write(o.Out, manifest, renderer, o.BaseUrl, o.Title, o.Pwa, registry.AppType);
        var ok = manifest.Entries.Count(e => e.Ok);
        foreach (var e in manifest.Entries.Where(e => !e.Ok))
            stderr.WriteLine($"mateu-bundle: skipped {e.Route} — {e.SkipReason}");
        Info($"mateu-bundle: {ok}/{manifest.Entries.Count} route(s) rendered → {Path.GetFullPath(o.Out)}");
        if (o.SpecsOnly && manifest.Definitions is { Count: > 0 } defs)
            Info($"mateu-bundle: specs mode — {defs.Count} raw definition(s) shipped for the browser to expand");
        if (o.FailOnEmpty && ok == 0)
        {
            stderr.WriteLine("mateu-bundle: no routes rendered");
            return 1;
        }
        if (o.StaticOnly)
        {
            var violations = StaticSafetyCheck.Check(manifest, exporter.ClassesByRoute());
            if (violations.Count > 0)
            {
                stderr.WriteLine(
                    $"mateu-bundle: the bundle is declared static (--static) but {violations.Count} thing(s) still"
                    + " need a server:\n" + string.Join("\n", violations.Select(v => "  " + v))
                    + "\nMake each one client-side (a restAction / [RestAction], a rowsSource / [RestListing], a"
                    + " direct source with no secret), or drop --static to deploy the bundle in front of a backend.");
                return 1;
            }
            Info("mateu-bundle: static-safety report clean — no route needs a server");
        }
        var skipped = manifest.Entries.Where(e => !e.Ok).ToList();
        if (o.FailOnSkipped && skipped.Count > 0)
        {
            stderr.WriteLine($"mateu-bundle: {skipped.Count} route(s) could not be bundled (--fail-on-skipped):\n"
                             + string.Join("\n", skipped.Select(e => $"  {e.Route} — {e.SkipReason}")));
            return 1;
        }
        return 0;
    }
}
