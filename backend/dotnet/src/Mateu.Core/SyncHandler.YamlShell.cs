using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// A route bound to a `type: AppShell` definition: the mount's APP, declared as data (Java's
// ActionInstanceCreator → YamlAppLoader → AppMapper). See YamlAppShell.
internal sealed partial class SyncHandler
{
    /// <summary>The app a <c>type: AppShell</c> definition declares, as the shell fragment — with the
    /// app-wide catalogues every app carries. Like an [App] class composing its shell in code, it
    /// names no window (the shell is not a page).</summary>
    private UIIncrementDto YamlShellResponse(IDictionary<object, object> shell, RunActionRqDto rq)
    {
        var shellRoute = RouteRegistry.Normalize(rq.Route);
        var app = YamlAppShell.Map(shell, shellRoute, _routes.MountHomeOf(shellRoute), null, _fieldTypes);
        app = WithBackLink(WithCatalogues(app), YamlAppShell.BackLinkParent(shell));
        return UIIncrementDto.Of(
            commands: [],
            fragments: [new UIFragmentDto(Target(rq), app, null, null, "Replace", null)]);
    }

    /// <summary>The <c>type: AppShell</c> definition bound to the root of the mount at
    /// <paramref name="baseUrl"/>, or null — what presents a YAML mount to the mobile app and the
    /// installable app (MobileManifest / Pwa), as Java's YamlMounts.manifestJson does.</summary>
    public IDictionary<object, object>? MountShell(string? baseUrl)
    {
        try
        {
            return _yaml.LoadSpec(baseUrl ?? "")?.Shell ?? _yaml.LoadSpec("")?.Shell;
        }
        catch (Exception)
        {
            return null; // a manifest is never refused over an unreadable definition
        }
    }

    /// <summary>The catalogues ride the APP metadata (app-wide configuration, not per response); a
    /// non-empty REST source catalogue adds the rest-sources capability (Java's AppMapper).</summary>
    private ClientSideComponentDto WithCatalogues(ClientSideComponentDto app)
    {
        if (app is not { Metadata: AppMetadataDto catalogued }) return app;
        var sampleMode = SampleMode;
        var sources = MateuCatalogs.MapCatalogue(MateuCatalogs.Sources, withSamples: sampleMode);
        var caps = new SortedSet<string>(catalogued.RequiredCapabilities, StringComparer.Ordinal);
        if (sources.Count > 0) caps.Add(Capabilities.RestSources);
        return app with
        {
            Metadata = catalogued with
            {
                RestSources = sources,
                Components = MateuCatalogs.MapComponents(MateuCatalogs.Components),
                ActionCatalogue = ActionRegistry.MapCatalogue(MateuCatalogs.ActionsForCaller),
                RequiredCapabilities = caps.ToList(),
                MockSources = sampleMode ? true : null,
                AgentPush = AgentPush is not null ? true : null,
            },
        };
    }
}
