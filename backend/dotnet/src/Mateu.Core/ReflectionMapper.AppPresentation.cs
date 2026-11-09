using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// The app shell's presentation members (Java's AppMapper: layout, accentColor, askLabel/askIcon,
// logo, favicon, drawerClosed, noBreadcrumbs, style, cssClasses and the app-level FABs).
internal sealed partial class ReflectionMapper
{
    private static AppMetadataDto WithAppPresentation(AppMetadataDto meta, Type appType, AppAttribute app) => meta with
    {
        Layout = string.Equals(app.Layout, "SPLIT", StringComparison.OrdinalIgnoreCase) ? "SPLIT" : "SINGLE_SLOT",
        AccentColor = AppText(app.AccentColor),
        AskLabel = AppText(app.AskLabel),
        AskIcon = AppText(app.AskIcon),
        Logo = AppText(appType.Find<LogoAttribute>()?.Value),
        Favicon = AppText(appType.Find<FavIconAttribute>()?.Value),
        DrawerClosed = appType.Find<DrawerClosedAttribute>() is not null,
        NoBreadcrumbs = appType.Find<NoBreadcrumbsAttribute>() is not null,
        Style = AppText(app.Style),
        CssClasses = AppText(app.CssClasses),
        Fabs = AppFabs(appType),
    };

    private static string? AppText(string? s) => string.IsNullOrWhiteSpace(s) ? null : s.Trim();

    /// <summary>[Fab] methods of the app class (Java's AppMapper.getAppFabs): id = action id = the
    /// method's name, label = its [Label] else the humanized name, sorted by order.</summary>
    private static List<FabDto> AppFabs(Type appType) =>
        appType.GetMethods(BindingFlags.Public | BindingFlags.Instance)
            .Where(m => m.Find<FabAttribute>() is not null)
            .OrderBy(m => m.Find<FabAttribute>()!.Order)
            .Select(m =>
            {
                var fab = m.Find<FabAttribute>()!;
                return new FabDto(fab.Icon, Naming.CamelCase(m.Name))
                {
                    Id = Naming.CamelCase(m.Name),
                    Label = fab.Label ?? m.Find<LabelAttribute>()?.Value ?? Naming.Humanize(m.Name),
                    Order = fab.Order,
                    ButtonStyle = "primary",
                };
            })
            .ToList();
}
