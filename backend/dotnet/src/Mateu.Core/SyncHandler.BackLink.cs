using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// [App(BackLink = Parent)] / a YAML shell's `backLink: PARENT` (Java's AppMapper.backLinkParent +
// parentLink): ONE "← Parent" link instead of the breadcrumb trail, to the nearest route above the
// app's that resolves to a screen, labelled with that screen's title — resolved here, against what
// this server serves.
internal sealed partial class SyncHandler
{
    /// <summary>The app with its "← Parent" link when it asks for one (else unchanged).</summary>
    private ClientSideComponentDto WithBackLink(ClientSideComponentDto app, bool backLinkParent)
    {
        if (!backLinkParent || app is not { Metadata: AppMetadataDto meta }) return app;
        var (route, label) = ParentLink(meta.RootRoute);
        return app with { Metadata = meta with { NoBreadcrumbs = true, BackRoute = route, BackLabel = label } };
    }

    /// <summary>The "← Parent" link of an app at <paramref name="appRoute"/>: the route and label of
    /// the nearest route ABOVE it that resolves to a screen — <c>/customers</c> ("Customers") for
    /// <c>/customers/7</c>. The label is the screen's [Title], else its last segment humanized.
    /// Both null when no route above resolves (an app at its mount's root has none).</summary>
    internal (string? Route, string? Label) ParentLink(string? appRoute)
    {
        var path = (appRoute ?? "").TrimEnd('/');
        while (path.LastIndexOf('/') > 0)
        {
            path = path[..path.LastIndexOf('/')];
            if (ScreenAt(path) is not { } screen) continue;
            var title = screen.Find<TitleAttribute>()?.Value;
            var segment = path[(path.LastIndexOf('/') + 1)..];
            return (path, !string.IsNullOrWhiteSpace(title)
                ? title
                : Naming.HumanizeConstant(segment.Replace('-', ' ')));
        }
        return (null, null);
    }

    /// <summary>The class answering <paramref name="path"/>: a [UI] route, else a routes.yaml entry
    /// bound to a view model (what Java's RoutedClassResolver resolves; a definition-only route has no
    /// class, and no title to label a link with).</summary>
    private Type? ScreenAt(string path) =>
        registry.Resolve(null, path)
        ?? (_routes.Match(path)?.Entry.ViewModel is { Length: > 0 } viewModel ? registry.TypeByName(viewModel) : null);
}
