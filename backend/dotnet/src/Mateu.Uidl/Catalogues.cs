namespace Mateu.Uidl;

// ── REST source catalogue (C# mirror of io.mateu.uidl.data.RestSource* / RestSourceCatalog) ──────

/// <summary>Whether the endpoint a <see cref="RestSourceEntry"/> names is one somebody ALREADY serves
/// (<see cref="Existing"/>) or one this project still owes (<see cref="Generate"/>). <see cref="Auto"/>
/// infers it from the url: relative / same-origin → generate, another origin → existing.
/// (Mirrors io.mateu.uidl.data.RestSourceProvenance.)</summary>
public enum RestSourceProvenance { Auto, Generate, Existing }

/// <summary>Which surface a REST source feeds; the wire name is what the renderer sends as
/// <c>_sourceKind</c> (options | rows | action | data). (Mirrors io.mateu.uidl.data.RestSourceKind.)</summary>
public enum RestSourceKind { Options, Rows, Action, Data }

public static class RestSourceKinds
{
    public static string WireName(this RestSourceKind kind) => kind switch
    {
        RestSourceKind.Options => "options",
        RestSourceKind.Rows => "rows",
        RestSourceKind.Action => "action",
        _ => "data",
    };

    /// <summary>The kind the renderer named, or null when it named none of them.</summary>
    public static RestSourceKind? FromWire(string? wireName) => wireName switch
    {
        "options" => RestSourceKind.Options,
        "rows" => RestSourceKind.Rows,
        "action" => RestSourceKind.Action,
        "data" => RestSourceKind.Data,
        _ => null,
    };
}

/// <summary>A REST endpoint descriptor, exactly as it travels to the renderer: INLINE (Url and the
/// paths) or by REFERENCE (<see cref="Ref"/> names a catalogue entry; the paths declared here still
/// win over the entry's). (Mirrors io.mateu.uidl.data.RestDataSource.)</summary>
public sealed record RestDataSource
{
    public string Ref { get; init; } = "";
    public string? Url { get; init; }
    public string? Method { get; init; }
    public IReadOnlyDictionary<string, string>? Headers { get; init; }
    public string? Body { get; init; }
    public string? ItemsPath { get; init; }
    public string? ValuePath { get; init; }
    public string? LabelPath { get; init; }
    public bool Proxy { get; init; }

    /// <summary>SAMPLE data: the response this endpoint would return (so the paths apply as usual),
    /// answered INSTEAD of calling it — only in sample mode (the visual editor, a bundle built with
    /// the mock flag, or an app that opted in with <c>MATEU_SOURCES_MOCK=true</c>). Never silently in
    /// production. Plain data (dictionaries, lists, scalars); null = no sample.</summary>
    public object? Sample { get; init; }

    /// <summary>True when this descriptor carries sample data.</summary>
    public bool CarriesSample() => Sample is not null;

    /// <summary>A descriptor that only names a catalogue entry.</summary>
    public static RestDataSource OfRef(string name) => new() { Ref = name.Trim() };

    /// <summary>True when this descriptor points at a catalogue entry instead of carrying its own url.</summary>
    public bool HasRef() => !string.IsNullOrWhiteSpace(Ref);

    /// <summary>This descriptor with the endpoint of <paramref name="entry"/> filled in, keeping
    /// whatever this one declares; proxy is on when either says so (Java's resolvedAgainst).</summary>
    public RestDataSource ResolvedAgainst(RestSourceEntry? entry)
    {
        if (entry?.Source is not { } from) return this;
        return this with
        {
            Url = Blank(Url) ? from.Url : Url,
            Method = Blank(Method) ? from.Method : Method,
            Headers = Headers is null || Headers.Count == 0 ? from.Headers : Headers,
            Body = Blank(Body) ? from.Body : Body,
            ItemsPath = Blank(ItemsPath) ? from.ItemsPath : ItemsPath,
            ValuePath = Blank(ValuePath) ? from.ValuePath : ValuePath,
            LabelPath = Blank(LabelPath) ? from.LabelPath : LabelPath,
            Proxy = Proxy || from.Proxy,
            Sample = Sample ?? entry.EffectiveSample(),
        };
    }

    private static bool Blank(string? s) => string.IsNullOrWhiteSpace(s);
}

/// <summary>One named entry of the REST source catalogue: an endpoint declared ONCE that any number
/// of surfaces reference by <see cref="Name"/>. <see cref="Fields"/> maps a flat field name to a dot
/// path into each item (a name it does not mention is its own path); <see cref="TotalPath"/> is the
/// server-paged total. (Mirrors io.mateu.uidl.data.RestSourceEntry.)</summary>
public sealed record RestSourceEntry(string Name, RestDataSource Source)
{
    public RestSourceProvenance Provenance { get; init; } = RestSourceProvenance.Auto;
    public IReadOnlyDictionary<string, string> Fields { get; init; } = new Dictionary<string, string>();
    public string TotalPath { get; init; } = "";
    public string Description { get; init; } = "";

    /// <summary>SAMPLE data — the response the endpoint would return — answered INSTEAD of calling
    /// it, in sample mode only (see <see cref="RestDataSource.Sample"/>).</summary>
    public object? Sample { get; init; }

    /// <summary>The same sample read from a JSON/YAML file, relative to the specs directory; the
    /// loader inlines it into <see cref="Sample"/> (an inline <c>sample:</c> wins).</summary>
    public string SampleFile { get; init; } = "";

    /// <summary>The sample this entry answers with in sample mode: its own, else the one its source
    /// carries inline; null when it has none.</summary>
    public object? EffectiveSample() => Sample ?? Source?.Sample;

    /// <summary>The effective provenance, never Auto: a declared value wins; Auto reads the url.</summary>
    public RestSourceProvenance EffectiveProvenance() =>
        Provenance != RestSourceProvenance.Auto ? Provenance
        : IsAbsolute(Source?.Url) ? RestSourceProvenance.Existing : RestSourceProvenance.Generate;

    /// <summary>The dot path a consumer reading <paramref name="fieldName"/> should follow.</summary>
    public string PathOf(string fieldName) =>
        Fields.TryGetValue(fieldName, out var mapped) && !string.IsNullOrWhiteSpace(mapped) ? mapped : fieldName;

    private static bool IsAbsolute(string? url)
    {
        if (url is null) return false;
        var t = url.Trim();
        return t.StartsWith("//", StringComparison.Ordinal)
               || System.Text.RegularExpressions.Regex.IsMatch(t, "^[a-zA-Z][a-zA-Z0-9+.\\-]*://");
    }
}

/// <summary>The catalogue of named REST sources. Authored (sources.yaml) merges OVER derived
/// ([RestSource] + suppliers), keyed by name, and an authored entry REPLACES the derived one
/// outright. (Mirrors io.mateu.uidl.data.RestSourceCatalog.)</summary>
public sealed record RestSourceCatalog(IReadOnlyList<RestSourceEntry> Sources)
{
    public static readonly RestSourceCatalog Empty = new([]);

    public bool HasNoSources() => Sources.Count == 0;

    public RestSourceEntry? Get(string? name) =>
        string.IsNullOrWhiteSpace(name) ? null : Sources.FirstOrDefault(e => e.Name == name.Trim());

    public RestSourceCatalog MergedOver(RestSourceCatalog? derived)
    {
        var byName = new Dictionary<string, RestSourceEntry>();
        var order = new List<string>();
        foreach (var e in (derived?.Sources ?? []).Concat(Sources))
        {
            if (!byName.ContainsKey(e.Name)) order.Add(e.Name);
            byName[e.Name] = e;
        }
        return new RestSourceCatalog(order.Select(n => byName[n]).ToList());
    }

    /// <summary>Only the entries this project has to implement.</summary>
    public IReadOnlyList<RestSourceEntry> ToImplement() =>
        Sources.Where(e => e.EffectiveProvenance() == RestSourceProvenance.Generate).ToList();

    /// <summary>Only the entries somebody else already serves.</summary>
    public IReadOnlyList<RestSourceEntry> Consumed() =>
        Sources.Where(e => e.EffectiveProvenance() == RestSourceProvenance.Existing).ToList();
}

/// <summary>Declares one named entry of the app's REST source catalogue on a registered view or app
/// class (repeatable). Surfaces then reference it by name (<c>[RestOptions(Source = "countries")]</c>)
/// instead of repeating the url. <see cref="Fields"/> are <c>"name=dot.path"</c>, <see cref="Headers"/>
/// <c>"Name: Value"</c>. (Mirrors Java's @RestSource.)</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class RestSourceAttribute(string name, string url) : Attribute
{
    public string Name { get; } = name;
    public string Url { get; } = url;
    public string Method { get; init; } = "GET";
    public string[] Headers { get; init; } = [];
    public string Body { get; init; } = "";
    public string ItemsPath { get; init; } = "";
    public string ValuePath { get; init; } = "value";
    public string LabelPath { get; init; } = "label";
    public string[] Fields { get; init; } = [];
    public string TotalPath { get; init; } = "";
    public RestSourceProvenance Provenance { get; init; } = RestSourceProvenance.Auto;
    public string Description { get; init; } = "";
    public bool Proxy { get; init; }
}

/// <summary>Implemented by a class (discovered in the scanned assemblies, parameterless constructor)
/// that contributes catalogue entries at runtime — from configuration, a database, per environment.
/// Must build them from what the SERVER holds, never from the request. (Mirrors Java's
/// RestSourceCatalogSupplier.)</summary>
public interface IRestSourceCatalogSupplier
{
    IReadOnlyList<RestSourceEntry> RestSources();
}

/// <summary>One REST source a view declares programmatically: the surface kind, the id within it
/// (field id for Options, action id for Action, ignored for Rows/Data) and the descriptor.
/// (Mirrors io.mateu.uidl.data.DeclaredRestSource.)</summary>
public sealed record DeclaredRestSource(RestSourceKind Kind, string Id, RestDataSource Source)
{
    public DeclaredRestSource(RestSourceKind kind, RestDataSource source) : this(kind, "", source) { }
}

/// <summary>Implemented by a VIEW that builds its REST sources at runtime instead of declaring them
/// as attributes, so they too can be fetched in proxy mode: they gate the __restfetch__ action and
/// resolve the proxied fetch exactly as attributes do. Build them from server-side state only —
/// never from the request or the component state. (Mirrors Java's RestSourceSupplier.)</summary>
public interface IRestSourceSupplier
{
    IReadOnlyList<DeclaredRestSource> DeclaredRestSources();
}

// ── Business-component catalogue (mirror of io.mateu.uidl.data.ComponentCatalog) ─────────────────

/// <summary>One named business component: a reusable BOUND composition referenced by name.</summary>
public sealed record ComponentEntry(string Name, IComponent? Component);

/// <summary>The catalogue of named business components; authored (components.yaml) merges over
/// derived, an authored entry replacing the derived one outright.</summary>
public sealed record ComponentCatalog(IReadOnlyList<ComponentEntry> Components)
{
    public static readonly ComponentCatalog Empty = new([]);

    public bool HasNoComponents() => Components.Count == 0;

    public ComponentEntry? Get(string? name) =>
        string.IsNullOrWhiteSpace(name) ? null : Components.FirstOrDefault(e => e.Name == name.Trim());

    public ComponentCatalog MergedOver(ComponentCatalog? derived)
    {
        var byName = new Dictionary<string, ComponentEntry>();
        var order = new List<string>();
        foreach (var e in (derived?.Components ?? []).Concat(Components))
        {
            if (!byName.ContainsKey(e.Name)) order.Add(e.Name);
            byName[e.Name] = e;
        }
        return new ComponentCatalog(order.Select(n => byName[n]).ToList());
    }
}

/// <summary>Marks a property or parameterless method holding a business component's composition (a
/// fluent component tree) as a named catalogue entry. Read from STATIC members, or from instance
/// members of a class with a parameterless constructor. (Mirrors Java's @BusinessComponent.)</summary>
[AttributeUsage(AttributeTargets.Property | AttributeTargets.Method | AttributeTargets.Field)]
public sealed class BusinessComponentAttribute(string name) : Attribute
{
    public string Name { get; } = name;
}

/// <summary>Implemented by a class (discovered in the scanned assemblies) that contributes business
/// components at runtime. (Mirrors Java's ComponentCatalogSupplier.)</summary>
public interface IComponentCatalogSupplier
{
    IReadOnlyList<ComponentEntry> BusinessComponents();
}
