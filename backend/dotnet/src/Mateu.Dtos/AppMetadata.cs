using System.Text.Json.Serialization;

namespace Mateu.Dtos;

public record AppMetadataDto(
    string Title,
    string Variant,
    IReadOnlyList<MenuItemDto> Menu) : ComponentMetadataDto
{
    public string Layout { get; init; } = "SINGLE_SLOT";
    public string HomeRoute { get; init; } = "";
    public string HomeConsumedRoute { get; init; } = "";

    /// <summary>The backend's public base URL — the shell loads its home content against it
    /// (mirrors AppDto.homeBaseUrl; without it the first auto-load fires page-relative).</summary>
    public string HomeBaseUrl { get; init; } = "";

    public string HomeServerSideType { get; init; } = "";
    public string ServerSideType { get; init; } = "";
    public string RootRoute { get; init; } = "";

    /// <summary>The mount's absolute base path — set for a declaratively-mapped app (the mount is
    /// its [UI] route); null for an AppSupplier that leaves its shell route unset. (Mirrors
    /// io.mateu.dtos.AppDto.route.)</summary>
    public string? Route { get; init; }

    /// <summary>Total number of menu options, submenus counted recursively. (Mirrors
    /// io.mateu.dtos.AppDto.totalMenuOptions.)</summary>
    public int TotalMenuOptions { get; init; }

    public string? Subtitle { get; init; }
    public string? LoginUrl { get; init; }
    public string? LogoutUrl { get; init; }

    /// <summary>SSE chat endpoint ([AI]); when set the renderer shows the floating AI chat.</summary>
    public string? SseUrl { get; init; }

    public IReadOnlyList<AppContextSelectorDto> ContextSelectors { get; init; } = [];

    /// <summary>Header action buttons next to the context selectors (the app class implements
    /// IAppActionsSupplier); an entry with Children renders as a dropdown.</summary>
    public IReadOnlyList<AppHeaderActionDto> ContextActions { get; init; } = [];

    /// <summary>True when the app class implements INotificationsSupplier — the shell shows the
    /// header bell, fed by the _notifications-list/_notifications-read app-level actions.</summary>
    public bool NotificationsEnabled { get; init; }

    /// <summary>True when the app class implements IGlobalSearchSupplier — the command palette
    /// also searches ENTITIES through the app-level _globalsearch action.</summary>
    public bool GlobalSearchEnabled { get; init; }

    /// <summary>[App(CommandCenter=true)] — the always-present command-center FAB + full-screen
    /// palette (the Ask-Oracle pattern). Implied by Chromeless.</summary>
    public bool CommandCenterEnabled { get; init; }

    /// <summary>[App(Chromeless=true)] — drop the nav chrome; the command center is the only
    /// navigation (implies CommandCenterEnabled).</summary>
    public bool Chromeless { get; init; }

    /// <summary>[App(AccessKeys=true)] — keyboard access-keys mode: holding Alt shows a key next to
    /// every visible button and tab and Alt+key activates it. (Mirrors AppDto.accessKeys.)</summary>
    public bool AccessKeys { get; init; }

    /// <summary>The app-scope data source seeded by a route entry's <c>appData</c> — the shell
    /// fetches it once into the app-data store, shared across routes. Null when no route on this
    /// mount declares app data. (Mirrors io.mateu.dtos.AppDto.appDataSource.)</summary>
    public RestDataSourceDto? AppDataSource { get; init; }

    /// <summary>The capability tokens this app REQUIRES from its host renderer: the app-scoped
    /// features it actually declares (derived from this metadata, so the developer never re-states
    /// what the model already says) plus whatever [App(Requires = new[]{...})] adds. The host
    /// compares these against what it PROVIDES and reports the difference — compatibility by
    /// capability, not by version. Sorted + deduped so the wire is stable. (Mirrors
    /// io.mateu.dtos.AppDto.requiredCapabilities.)</summary>
    public IReadOnlyList<string> RequiredCapabilities { get; init; } = [];

    /// <summary>The app's REST source catalogue: a surface referencing a source carries only its name
    /// (RestDataSourceDto.Ref), the endpoint travels once, here. Empty when the app declares no named
    /// source. (Mirrors io.mateu.dtos.AppDto.restSources.)</summary>
    public IReadOnlyList<RestSourceEntryDto> RestSources { get; init; } = [];

    /// <summary>The app's business-component catalogue, each composition already mapped to the wire,
    /// so a client-side expander can resolve a ComponentRef with no backend. (Mirrors
    /// io.mateu.dtos.AppDto.components.)</summary>
    public IReadOnlyList<ComponentEntryDto> Components { get; init; } = [];
}

/// <summary>One named entry of the REST source catalogue as it travels to the renderer. Provenance is
/// "generate" | "existing" (never auto). (Mirrors io.mateu.dtos.RestSourceEntryDto.)</summary>
public record RestSourceEntryDto(
    string Name,
    RestDataSourceDto Source,
    IReadOnlyDictionary<string, string> Fields,
    string TotalPath,
    string Provenance,
    string Description);

/// <summary>One named business component with its resolved composition. (Mirrors
/// io.mateu.dtos.ComponentEntryDto.)</summary>
public record ComponentEntryDto(string Name, ComponentDto? Component);

/// <summary>An application-level context selector shown on the app header: fixes a value for
/// every screen (the active hotel, the company…). The picked value lives in the app state under
/// FieldName and travels with every request.</summary>
public record AppContextSelectorDto(string FieldName, string Label, IReadOnlyList<OptionDto> Options);

/// <summary>An action button on the app header, next to the app-context selectors. An entry with
/// Children renders as a dropdown menu: only the children dispatch.</summary>
public record AppHeaderActionDto(
    string? ActionId, string Label, string? Icon, IReadOnlyList<AppHeaderActionDto>? Children);

public record MenuItemDto(string Label, string Route, string ServerSideType)
{
    public string ConsumedRoute { get; init; } = "";

    /// <summary>The leaf's route RELATIVE to the mount (the bare "/a"); <see cref="Route"/> is the
    /// mount-prefixed absolute route. (Mirrors io.mateu.dtos.MenuOptionDto.path.)</summary>
    public string? Path { get; init; }

    /// <summary>The mount base path this option lives under — carried on every leaf so the client
    /// can strip it back off. (Mirrors io.mateu.dtos.MenuOptionDto.uriPrefix.)</summary>
    public string? UriPrefix { get; init; }

    public string? ActionId { get; init; }
    public bool Separator { get; init; }
    public bool Visible { get; init; } = true;
    public IReadOnlyList<MenuItemDto> Submenus { get; init; } = [];

    /// <summary>Federated entry ([RemoteMenu]): the frontend fetches the remote backend's menu
    /// from BaseUrl and mounts its views under this option.</summary>
    public bool Remote { get; init; }

    public string? BaseUrl { get; init; }

    /// <summary>Inline the remote entries at this level instead of nesting under Label.</summary>
    public bool Explode { get; init; }

    /// <summary>Client-side rules this menu entry RUNS when clicked instead of navigating — a menu
    /// method typed Rule / IReadOnlyList&lt;Rule&gt; is a rule leaf, not a route. Empty on a normal
    /// (navigating) entry. (Mirrors io.mateu.dtos.MenuOptionDto.rules / RuleLink.)</summary>
    public IReadOnlyList<RuleDto> Rules { get; init; } = [];

    /// <summary>The entry's icon (an icon name like "vaadin:calendar"); null for none. Shown on a
    /// card. (Mirrors io.mateu.dtos.MenuOptionDto.icon.)</summary>
    public string? Icon { get; init; }

    /// <summary>The entry's description — the text of a card. (Mirrors
    /// io.mateu.dtos.MenuOptionDto.description.)</summary>
    public string? Description { get; init; }

    /// <summary>A GROUP that opens as a panel of cards ("cards") instead of the usual list (null).
    /// Its entries are the cards; each entry's own Submenus are the card's actions. (Mirrors
    /// io.mateu.dtos.MenuOptionDto.display.)</summary>
    public string? Display { get; init; }

    /// <summary>The image of an entry shown as a card (a URL or a data URI); null for none.
    /// (Mirrors io.mateu.dtos.MenuOptionDto.image.)</summary>
    public string? Image { get; init; }
}
