namespace Mateu.Uidl;

/// <summary>An identity restriction authored as DATA — the YAML twin of [EyesOnly] /
/// [ReadOnlyUnless] / [DisabledUnless], with the same four dimensions and the same matching (AND
/// across declared dimensions, OR within one; nothing declared → unrestricted; no identity →
/// denied). Authored as <c>access:</c> on a routes.yaml entry (403 for the route and everything
/// nested under it) or on a declared action (not advertised, buttons naming it disabled, 403 if
/// called), and as <c>eyesOnly:</c> / <c>readOnlyUnless:</c> / <c>disabledUnless:</c> on any
/// component of a definition. Always decided on the server. (Mirrors Java's io.mateu.uidl.data.Access.)</summary>
public sealed record Access(
    IReadOnlyList<string>? Roles = null,
    IReadOnlyList<string>? Groups = null,
    IReadOnlyList<string>? Scopes = null,
    IReadOnlyList<string>? Permissions = null)
{
    public IReadOnlyList<string> RolesOrEmpty => Roles ?? [];
    public IReadOnlyList<string> GroupsOrEmpty => Groups ?? [];
    public IReadOnlyList<string> ScopesOrEmpty => Scopes ?? [];
    public IReadOnlyList<string> PermissionsOrEmpty => Permissions ?? [];

    /// <summary>Restricted to the given roles only — the common case.</summary>
    public static Access OfRoles(params string[] roles) => new(Roles: roles);

    /// <summary>Whether any dimension is declared — an empty restriction lets everybody through.</summary>
    public bool Restricts() =>
        RolesOrEmpty.Count + GroupsOrEmpty.Count + ScopesOrEmpty.Count + PermissionsOrEmpty.Count > 0;
}

/// <summary>One locale's message catalogue: a <c>type: Translations</c> file under specs/ui (or
/// <c>specs/ui/translations/&lt;locale&gt;.yaml</c>), or what an <see cref="ITranslationsSupplier"/>
/// contributes. Nested maps are flattened with dots, referenced as <c>${i18n.orders.title}</c>.
/// (Mirrors Java's io.mateu.uidl.data.Translations.)</summary>
public sealed record Translations(string Locale, IReadOnlyDictionary<string, object?> Messages);

/// <summary>The CODE producer of the translation catalogue (discovered by assembly scan, like the
/// other suppliers). Its messages merge UNDER the authored files — authored wins key by key.</summary>
public interface ITranslationsSupplier
{
    IReadOnlyList<Translations> Translations();
}

/// <summary>A deployment environment: per-source overrides of the REST source catalogue, so the
/// same sources.yaml can point at pre or pro without being edited. A <c>type: Environment</c> file
/// (or <c>specs/ui/environments/&lt;name&gt;.yaml</c>), active via MATEU_ENVIRONMENT or
/// MateuOptions.Environment. Never put a secret here: credentials stay <c>${secret.X}</c>.
/// (Mirrors Java's io.mateu.uidl.data.Environment.)</summary>
public sealed record MateuEnvironment(string Name, IReadOnlyDictionary<string, SourceOverride> Sources);

/// <summary>What an environment may change about a catalogue entry — its DEPLOYMENT, never its
/// contract: <c>BaseUrl</c> replaces the url's origin (a relative url gets it prepended),
/// <c>Url</c> replaces it whole (wins), <c>Headers</c> merge over (this one wins per name),
/// <c>Proxy</c> replaces the flag when set.</summary>
public sealed record SourceOverride(
    string? BaseUrl = null,
    string? Url = null,
    IReadOnlyDictionary<string, string>? Headers = null,
    bool? Proxy = null);
