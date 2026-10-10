using System.Text.Json;
using System.Text.RegularExpressions;
using Microsoft.Extensions.Logging;

namespace Mateu.Core;

/// <summary>Anything that reads the specs once and keeps the result (a registry, a catalogue, a
/// parsed-definition cache). In development mode the specs are edited while the app runs, so every
/// such cache is dropped when a file changes. <b>The hook for a new catalogue is one line</b>:
/// implement this and call <c>DevSpecs.Register(this)</c> from the constructor.</summary>
public interface ISpecsCache
{
    /// <summary>Drops whatever was loaded from the specs; the next read loads it again.</summary>
    void InvalidateSpecs();
}

/// <summary>
/// Development mode — the .NET twin of Java's <c>io.mateu.core.infra.dev</c>: OFF unless
/// <c>MATEU_DEV=true</c> (or <c>AddMateu(o =&gt; o.Dev = true)</c>). When on, a
/// <see cref="FileSystemWatcher"/> over the specs directory drops every registered
/// <see cref="ISpecsCache"/> on change (debounced) and the change is streamed to the browsers through
/// <c>GET /mateu/dev/events</c> (same JSON events as the Java backend: <c>hello</c> with a boot id,
/// <c>specs-changed</c> with scope <c>page</c>|<c>app</c>, <c>reload</c>, <c>ping</c>);
/// <c>POST /mateu/dev/reload</c> asks for a re-render. Combine with <c>dotnet watch</c> for C#
/// changes: the restarted app has a new boot id, which makes the open browsers re-render.
/// </summary>
public static class DevSpecs
{
    public const string EventsPath = "/mateu/dev/events";
    public const string ReloadPath = "/mateu/dev/reload";
    public const string ScopePage = "page";
    public const string ScopeApp = "app";

    /// <summary>Identifies this process: a client seeing it change knows the server restarted.</summary>
    public static readonly string BootId = Guid.NewGuid().ToString();

    private static readonly List<WeakReference<ISpecsCache>> Caches = [];
    private static readonly List<Action<string>> Listeners = [];
    private static readonly Regex AppLevelType =
        new(@"^type:\s*['""]?(UI|Routes|AppShell|App|Project|Environment|Translations|Actions)['""]?\s*$", RegexOptions.Multiline);
    private static bool? _forced;
    private static FileSystemWatcher? _watcher;
    private static Timer? _debounce;
    private static readonly HashSet<string> Pending = [];
    private static string? _dir;

    /// <summary>Whether dev mode is on (<c>MATEU_DEV=true</c>, or forced by the host).</summary>
    public static bool Enabled =>
        _forced ?? string.Equals(Environment.GetEnvironmentVariable("MATEU_DEV"), "true", StringComparison.OrdinalIgnoreCase);

    /// <summary>The specs directory dev mode watches (MATEU_DEV_SPECS_DIR, else MATEU_SPECS_DIR, else
    /// specs/ui — the same directory the registries read).</summary>
    public static string SpecsDir =>
        _dir ?? Environment.GetEnvironmentVariable("MATEU_DEV_SPECS_DIR")
             ?? Environment.GetEnvironmentVariable("MATEU_SPECS_DIR")
             ?? Path.Combine("specs", "ui");

    /// <summary>Registers a cache to be dropped when the specs change (weakly held).</summary>
    public static void Register(ISpecsCache cache)
    {
        lock (Caches) Caches.Add(new WeakReference<ISpecsCache>(cache));
    }

    /// <summary>Turns dev mode on (or off) and starts (or stops) the watcher. Logs a loud warning.</summary>
    public static void Enable(bool on = true, string? specsDir = null)
    {
        _forced = on;
        if (specsDir != null) _dir = specsDir;
        _watcher?.Dispose();
        _watcher = null;
        if (!on) return;
        MateuLogging.For("Mateu.Dev").LogWarning(
            "MATEU DEVELOPMENT MODE IS ON (MATEU_DEV=true): specs in {Dir} are watched and {Events} / {Reload} are " +
            "served. NEVER enable this in production.", Path.GetFullPath(SpecsDir), EventsPath, ReloadPath);
        InvalidateAll();
        if (!Directory.Exists(SpecsDir)) return;
        var watcher = new FileSystemWatcher(Path.GetFullPath(SpecsDir))
        {
            IncludeSubdirectories = true,
            NotifyFilter = NotifyFilters.FileName | NotifyFilters.LastWrite | NotifyFilters.Size | NotifyFilters.DirectoryName,
        };
        FileSystemEventHandler onChange = (_, e) => Queue(e.FullPath);
        watcher.Changed += onChange;
        watcher.Created += onChange;
        watcher.Deleted += onChange;
        watcher.Renamed += (_, e) => { Queue(e.OldFullPath); Queue(e.FullPath); };
        watcher.EnableRaisingEvents = true;
        _watcher = watcher;
    }

    /// <summary>Starts dev mode when the environment says so. Idempotent.</summary>
    public static void StartIfEnabled()
    {
        if (Enabled && _watcher == null) Enable(true);
    }

    private static void Queue(string path)
    {
        lock (Pending)
        {
            Pending.Add(path);
            _debounce?.Dispose();
            // an editor's save is a burst of events: one notification per burst
            _debounce = new Timer(_ => Flush(), null, 150, Timeout.Infinite);
        }
    }

    private static void Flush()
    {
        List<string> files;
        lock (Pending)
        {
            files = [.. Pending];
            Pending.Clear();
        }
        if (files.Count > 0) Changed(files);
    }

    /// <summary>Drops every registered cache.</summary>
    public static void InvalidateAll()
    {
        List<WeakReference<ISpecsCache>> snapshot;
        lock (Caches)
        {
            Caches.RemoveAll(r => !r.TryGetTarget(out _));
            snapshot = [.. Caches];
        }
        foreach (var reference in snapshot)
            if (reference.TryGetTarget(out var cache)) cache.InvalidateSpecs();
    }

    /// <summary>Spec files changed: drop every cache and tell the browsers.</summary>
    public static void Changed(IEnumerable<string> files)
    {
        InvalidateAll();
        var list = files.ToList();
        var scope = list.Any(IsAppLevel) ? ScopeApp : ScopePage;
        var names = list.Select(RelativeName).Distinct().ToList();
        Emit(JsonSerializer.Serialize(new { type = "specs-changed", files = names, scope }));
    }

    /// <summary>Re-render the screen of every open browser (the IDE's trigger after a code change).</summary>
    public static void Reload(string? scope = null)
    {
        InvalidateAll();
        Emit(JsonSerializer.Serialize(new { type = "reload", scope = scope == ScopeApp ? ScopeApp : ScopePage }));
    }

    /// <summary>The first event of every connection.</summary>
    public static string Hello() => JsonSerializer.Serialize(new { type = "hello", bootId = BootId });

    /// <summary>Listens to the events (JSON payloads); dispose to stop.</summary>
    public static IDisposable Subscribe(Action<string> listener)
    {
        lock (Listeners) Listeners.Add(listener);
        return new Unsubscriber(listener);
    }

    private sealed class Unsubscriber(Action<string> listener) : IDisposable
    {
        public void Dispose()
        {
            lock (Listeners) Listeners.Remove(listener);
        }
    }

    private static void Emit(string json)
    {
        List<Action<string>> snapshot;
        lock (Listeners) snapshot = [.. Listeners];
        foreach (var listener in snapshot)
        {
            try { listener(json); } catch { /* a listener that fails is a browser that went away */ }
        }
    }

    internal static bool IsAppLevel(string file)
    {
        var name = Path.GetFileName(file);
        if (name is "routes.yaml" or "routes.yml" or "sources.yaml" or "project.yaml" or "actions.yaml") return true;
        // translations/ and environments/ files may omit their type: header — app-wide either way
        if (Path.GetFileName(Path.GetDirectoryName(file) ?? "") is "translations" or "environments") return true;
        if (!File.Exists(file)) return true; // deleted: whatever it was, it may have been a mount
        try { return AppLevelType.IsMatch(File.ReadAllText(file)); }
        catch (IOException) { return true; }
    }

    private static string RelativeName(string file)
    {
        var root = Path.GetFullPath(SpecsDir);
        var full = Path.GetFullPath(file);
        return full.StartsWith(root, StringComparison.Ordinal)
            ? "specs/ui/" + Path.GetRelativePath(root, full).Replace('\\', '/')
            : full;
    }
}
