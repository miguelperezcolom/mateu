using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// Reads the project descriptor (<c>specs/ui/project.yaml</c>, <c>type: Project</c>) and compares the
/// renderer it declares with the one this server actually SERVES — the .NET twin of Java's
/// <c>ProjectRendererCheck</c>.
///
/// <para>For a served app the configured renderer (<c>MapMateu(ui: …)</c> / <c>MATEU_UI</c>) stays the
/// source of truth: it is what the index page boots. The descriptor is what the visual editor, Play
/// and the static bundle paint with, so when the two disagree the app a developer designed is not
/// the app a user gets — worth one clear WARN at startup, never a failure.</para>
/// </summary>
internal static class ProjectRendererCheck
{
    /// <summary>Where a project keeps its descriptor (Java's ProjectSettings.CONVENTIONAL_PATH).</summary>
    public const string ConventionalPath = "specs/ui/project.yaml";

    /// <summary>A file only the Redwood (Visual Builder) renderer ships (Java's REDWOOD_MARKER, under
    /// the renderer's <c>static/</c>).</summary>
    public const string RedwoodMarker = "_redwood/app-flow.json";

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    /// <summary>The renderer the project declares — <c>vaadin</c> (the default when the descriptor
    /// names none) or <c>redwood</c> — or null when the specs have no descriptor (nothing declared):
    /// <c>project.yaml</c>, else the first <c>type: Project</c> file under the specs.</summary>
    public static string? Declared(string specsDir)
    {
        if (!Directory.Exists(specsDir)) return null;
        var conventional = Path.Combine(specsDir, "project.yaml");
        if (File.Exists(conventional) && Parse(File.ReadAllText(conventional)) is { } declared) return declared;
        foreach (var file in Directory.EnumerateFiles(specsDir, "*.y*ml", SearchOption.AllDirectories)
                     .Where(f => f.EndsWith(".yaml") || f.EndsWith(".yml")).OrderBy(f => f, StringComparer.Ordinal))
        {
            string text;
            try { text = File.ReadAllText(file); }
            catch (IOException) { continue; }
            if (Parse(text) is { } found) return found;
        }
        return null;
    }

    /// <summary>The renderer a <c>type: Project</c> document declares; null when it is not one. An
    /// unknown name reads as <c>vaadin</c> (Java's ProjectRenderer.parse fallback).</summary>
    public static string? Parse(string yaml)
    {
        try
        {
            if (Yaml.Deserialize<object?>(yaml) is not IDictionary<object, object> root) return null;
            if (!root.TryGetValue("type", out var type) || type?.ToString() != "Project") return null;
            var renderer = root.TryGetValue("renderer", out var r) ? r?.ToString()?.Trim().ToLowerInvariant() : null;
            return renderer is "redwood" ? "redwood" : "vaadin";
        }
        catch (YamlDotNet.Core.YamlException)
        {
            return null;
        }
    }

    /// <summary>The renderer this server serves: <c>redwood</c> when its files carry the Visual
    /// Builder app, <c>vaadin</c> for any other page, null when it serves none (a headless backend).</summary>
    public static string? Served(RendererFiles? renderer) =>
        renderer is null ? null : renderer.Read(RedwoodMarker) is not null ? "redwood" : "vaadin";

    /// <summary>The warning to log, or null when there is nothing to say: no descriptor, no renderer
    /// served, or both agree (Java's ProjectRendererCheck.mismatch, the coordinates in .NET's terms).</summary>
    public static string? Mismatch(string? declared, string? served)
    {
        if (declared is null || served is null || declared == served) return null;
        return $"The project descriptor ({ConventionalPath}) says renderer: {declared}, but this server serves "
               + $"{served} (MapMateu(ui: …) / MATEU_UI points at the mateu-{served} renderer). The served app "
               + "follows that setting, so it will NOT look like what the visual editor, Play and the static "
               + $"bundle show. Point it at the mateu-{declared} renderer instead, or set renderer: {served} in "
               + "the descriptor.";
    }
}
