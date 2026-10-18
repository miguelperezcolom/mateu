using Microsoft.Extensions.Logging;
using Mateu.Uidl;
using YamlDotNet.Serialization;

namespace Mateu.Core;

/// <summary>
/// Builds a fluent component tree from YAML page text — the visual-builder live preview (mirrors
/// Java's YamlUidlLoader.parseText). The YAML uses a `type` discriminator; this dispatches on it and
/// reads the YAML keys into the fluent components (handling the name differences: a FormField's
/// `id` → FieldId, a Text's `text` → Content). Envelope-aware: unwraps a `layout:` key. The tree is
/// then mapped to the wire by the normal <see cref="ComponentMapper"/>.
/// </summary>
/// <remarks>
/// A <c>type: Partial</c> node is resolved here, against a <see cref="PartialRegistry"/>, and never
/// reaches the built tree — so nothing downstream, and no renderer, has to know partials exist.
/// </remarks>
internal static class YamlComponentBuilder
{
    /// <summary>A partial chain longer than this is a bug, not a design.</summary>
    private const int MaxDepth = 20;

    private static readonly IDeserializer Yaml = new DeserializerBuilder().Build();

    /// <summary>Raw YAML → nodes, for callers that splice before building (the partial registry).</summary>
    public static object? Deserialize(string yaml)
    {
        try { return Yaml.Deserialize<object>(yaml); }
        catch (Exception e)
        {
            MateuLogging.For("Mateu.Yaml").LogWarning("Invalid YAML ignored: {Error}", e.Message);
            return null;
        }
    }

    /// <summary>An already-deserialised YAML node as a component (components.yaml entries).</summary>
    internal static IComponent? FromNode(object? node, FieldTypeRegistry? types = null) =>
        Single(node, new Ctx(PartialRegistry.Default, types ?? FieldTypeRegistry.None), []);

    public static IComponent? Parse(string yaml, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return null;
        var root = Deserialize(yaml);
        if (root is null) return null;
        // Page envelope: render the layout; a bare component tree renders as-is.
        var node = root is IDictionary<object, object> map && map.TryGetValue("layout", out var layout)
            ? layout
            : root;
        return Single(node, new Ctx(partials ?? PartialRegistry.Default, types ?? FieldTypeRegistry.None), []);
    }

    /// <summary>
    /// Parse a page spec (a file under specs/ui): the declared ModelView class name (or null for a
    /// bare, unbound layout) plus the layout component. Envelope-aware — a `layout:` key holds the
    /// tree and a `modelView:` key names the logic class the tooling binds it to.
    /// </summary>
    public static (string? ModelView, IComponent? Layout) ParseSpec(
        string yaml, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        var (modelView, layout, _) = ParsePage(yaml, partials, types);
        return (modelView, layout);
    }

    /// <summary>
    /// Parse a page spec with its <c>layoutDelta:</c>: the ModelView class name (the canonical
    /// <c>viewModel:</c> or the legacy <c>modelView:</c> key), the explicit layout (a SNAPSHOT —
    /// null for a delta-only page) and the delta (empty when none; mirrors Java's
    /// YamlUidlLoader.deltaOf).
    /// </summary>
    public static (string? ModelView, IComponent? Layout, LayoutDelta Delta) ParsePage(
        string yaml, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        if (string.IsNullOrWhiteSpace(yaml)) return (null, null, LayoutDelta.Empty);
        return ParsePageNode(Deserialize(yaml), partials, types);
    }

    /// <summary>The page type a definition DECLARES (<c>pageType:</c> beside <c>layout:</c>) as its wire
    /// name, or null when it declares none — the YAML twin of [PageTemplate]: a declared type wins
    /// over the shape inference. Matched without regard to case; an unknown value is ignored, so a
    /// typo never costs the page (mirrors Java's YamlUidlLoader.pageTypeOf).</summary>
    public static string? PageTypeOf(object? root)
    {
        if (root is not IDictionary<object, object> map || !map.TryGetValue("pageType", out var raw)) return null;
        var declared = raw?.ToString()?.Trim();
        if (string.IsNullOrEmpty(declared)) return null;
        foreach (var type in Enum.GetValues<Mateu.Uidl.PageType>())
            if (string.Equals(type.ToString(), declared, StringComparison.OrdinalIgnoreCase))
                return type.ToString().ToLowerInvariant();
        MateuLogging.For("Mateu.Yaml").LogWarning(
            "Unknown pageType '{PageType}' ignored (expected landing, collection, detail, form, process or dashboard) — the page type is inferred instead",
            declared);
        return null;
    }

    /// <summary><see cref="ParsePage(string, PartialRegistry?, FieldTypeRegistry?)"/> over an already-deserialised tree —
    /// what a per-request personalised spec (access keys applied, <c>${i18n.…}</c> resolved) is
    /// re-built from.</summary>
    public static (string? ModelView, IComponent? Layout, LayoutDelta Delta) ParsePageNode(
        object? root, PartialRegistry? partials = null, FieldTypeRegistry? types = null)
    {
        if (root is null) return (null, null, LayoutDelta.Empty);
        var registry = new Ctx(partials ?? PartialRegistry.Default, types ?? FieldTypeRegistry.None);
        if (root is not IDictionary<object, object> map) return (null, Single(root, registry, []), LayoutDelta.Empty);
        var modelView = map.TryGetValue("modelView", out var mv) ? mv?.ToString()
            : map.TryGetValue("viewModel", out var vm) ? vm?.ToString() : null;
        var delta = DeltaOf(map);
        // A page that carries a `layoutDelta:` and no `layout:` has NO explicit layout on purpose —
        // that is the whole point of a delta: the view model's INFERRED layout renders and the delta
        // is re-applied on top. Falling back to "the whole document is the tree" here would render
        // the envelope itself as a component.
        if (!map.ContainsKey("layout") && map.ContainsKey("layoutDelta"))
            return (modelView, null, delta);
        var layoutNode = map.TryGetValue("layout", out var layout) ? layout : root;
        return (modelView, Single(layoutNode, registry, []), delta);
    }

    /// <summary>The <c>layoutDelta:</c> of a page — order, hidden, per-field overrides
    /// (label/colspan/section) — or <see cref="LayoutDelta.Empty"/>.</summary>
    private static LayoutDelta DeltaOf(IDictionary<object, object> root)
    {
        if (!root.TryGetValue("layoutDelta", out var node) || node is not IDictionary<object, object> delta)
            return LayoutDelta.Empty;
        static List<string> Strings(IDictionary<object, object> map, string key) =>
            map.TryGetValue(key, out var v) && v is IEnumerable<object> list
                ? list.Where(i => i is not null).Select(i => i.ToString()!).ToList()
                : [];
        var overrides = new Dictionary<string, LayoutDelta.FieldOverride>();
        if (delta.TryGetValue("overrides", out var o) && o is IDictionary<object, object> map)
            foreach (var (key, value) in map)
            {
                if (key?.ToString() is not { } fieldId) continue;
                var spec = value as IDictionary<object, object>;
                string? Str(string k) => spec is not null && spec.TryGetValue(k, out var s) ? s?.ToString() : null;
                overrides[fieldId] = new LayoutDelta.FieldOverride(
                    Str("label"),
                    int.TryParse(Str("colspan"), out var colspan) ? colspan : null,
                    Str("section"));
            }
        return new LayoutDelta(Strings(delta, "order"), Strings(delta, "hidden"), overrides);
    }

    /// <summary>What a node becomes in a slot that holds exactly one component.</summary>
    /// <summary>What a build carries down the tree: the partials to splice and the field types to
    /// resolve (a <c>fieldType:</c> reference is resolved on each node before it is built, partial
    /// nodes included).</summary>
    private sealed record Ctx(PartialRegistry Partials, FieldTypeRegistry Types);

    private static IComponent? Single(object? node, Ctx partials, List<string> chain)
    {
        var expanded = InList(node, partials, chain);
        return expanded.Count switch
        {
            0 => null,
            1 => expanded[0],
            // Nowhere to splice into: stacking beats dropping all but the first.
            _ => new VerticalLayout { Content = expanded },
        };
    }

    /// <summary>What a node becomes in a content list — where a partial may contribute several.</summary>
    private static List<IComponent> InList(object? node, Ctx partials, List<string> chain)
    {
        if (node is IDictionary<object, object> map && Str(map, "type") == "Partial")
        {
            var reference = Str(map, "ref") ?? "";
            var key = partials.Partials.Key(reference);
            if (chain.Contains(key) || chain.Count >= MaxDepth) return [];
            chain.Add(key);
            try
            {
                return partials.Partials.Resolve(reference)
                    .SelectMany(child => InList(child, partials, chain))
                    .ToList();
            }
            finally
            {
                chain.RemoveAt(chain.Count - 1);
            }
        }
        var built = Build(node, partials, chain);
        return built is null ? [] : [built];
    }

    private static IComponent? Build(object? node, Ctx partials, List<string> chain)
    {
        if (node is not IDictionary<object, object> declared) return null;
        var map = partials.Types.Resolve(declared);
        return Str(map, "type") switch
        {
            "VerticalLayout" => new VerticalLayout { Spacing = Bool(map, "spacing"), Content = Children(map, partials, chain) },
            "HorizontalLayout" => new HorizontalLayout { Spacing = Bool(map, "spacing", true), Content = Children(map, partials, chain) },
            // .NET has no standalone FormLayout fluent — a stacked VerticalLayout is a faithful preview.
            "FormLayout" => new VerticalLayout { Content = Children(map, partials, chain) },
            "FormField" => new FormField
            {
                FieldId = Str(map, "id") ?? "",
                DataType = Str(map, "dataType") ?? "string",
                Label = Str(map, "label"),
                Stereotype = Str(map, "stereotype") ?? "regular",
                Required = Bool(map, "required"),
                ReadOnly = Bool(map, "readOnly"),
                Options = map.TryGetValue("options", out var o) && o is IEnumerable<object> options
                    ? options.OfType<IDictionary<object, object>>()
                        .Select(opt => new Option(Str(opt, "value") ?? "", Str(opt, "label") ?? Str(opt, "value") ?? ""))
                        .ToList()
                    : [],
                Style = Str(map, "style"),
                CssClasses = Str(map, "cssClasses"),
            },
            "Button" => new Button(Str(map, "label") ?? "", Str(map, "actionId") ?? "")
            {
                Primary = Str(map, "buttonStyle") == "primary",
                Disabled = Bool(map, "disabled"),
                Route = RouteLinkOf(map),
            },
            // A listing authored as data: rows from a REST source, fetched client-side (the yaml
            // starter's products page). Before 2026-10-17 it rendered "Unsupported component".
            "Listing" => BuildListing(map, partials, chain),
            "Text" => new Text(Str(map, "text") ?? ""),
            // a C# member cannot share its record's name: the `markdown` key is MarkdownText
            "Markdown" => new Markdown { MarkdownText = Str(map, "markdown") ?? "", Style = Str(map, "style"), CssClasses = Str(map, "cssClasses") },
            "Form" => BuildForm(map, partials, chain),
            // A reference to a named business component (components.yaml / [BusinessComponent]).
            "ComponentRef" => new ComponentRef(Str(map, "ref") ?? ""),
            var other => Generic(other, map, partials, chain) ?? new Text($"Unsupported component: {other}"),
        };
    }

    // ── Every other component, read generically off its fluent record ─────────────────────────
    // The YAML keys ARE the Java record's components (camelCase), the .NET record's properties
    // their PascalCase: a node of any type the fluent API has is built property by property —
    // nested components, lists of them, nested value records, enums, dates. Before this every
    // display component (Card, MetricCard, Notice, Calendar, Kanban…) authored in YAML rendered
    // "Unsupported component" on the .NET server.

    private static readonly Lazy<Dictionary<string, Type>> ComponentTypes = new(() =>
        typeof(IComponent).Assembly.GetTypes()
            .Where(t => !t.IsAbstract && typeof(IComponent).IsAssignableFrom(t))
            .GroupBy(t => t.Name)
            .ToDictionary(g => g.Key, g => g.First()));

    private static IComponent? Generic(string? kind, IDictionary<object, object> map, Ctx partials, List<string> chain)
    {
        if (kind is null || !ComponentTypes.Value.TryGetValue(kind, out var type)) return null;
        try { return ObjectOf(type, map, partials, chain) as IComponent; }
        catch { return null; } // a value the record refuses: say so, as for an unknown type
    }

    private static object? ObjectOf(Type type, IDictionary<object, object> map, Ctx partials, List<string> chain)
    {
        var byKey = map.Where(e => e.Key is string).ToDictionary(e => ((string)e.Key).ToLowerInvariant(), e => e.Value);
        object? ValueFor(string name, Type target) =>
            byKey.TryGetValue(name.ToLowerInvariant(), out var raw) ? Convert(target, raw, partials, chain) : null;
        var ctor = type.GetConstructors().OrderBy(c => c.GetParameters().Length).First();
        var args = ctor.GetParameters().Select(p => ValueFor(p.Name ?? "", p.ParameterType)
            ?? (p.HasDefaultValue ? p.DefaultValue : DefaultOf(p.ParameterType))).ToArray();
        var instance = ctor.Invoke(args);
        var fromCtor = ctor.GetParameters().Select(p => (p.Name ?? "").ToLowerInvariant()).ToHashSet();
        foreach (var prop in type.GetProperties().Where(p => p.CanWrite && !fromCtor.Contains(p.Name.ToLowerInvariant())))
        {
            if (!byKey.ContainsKey(prop.Name.ToLowerInvariant())) continue;
            var value = ValueFor(prop.Name, prop.PropertyType);
            if (value is not null) prop.SetValue(instance, value);
        }
        return instance;
    }

    private static object? DefaultOf(Type t) =>
        t == typeof(string) ? "" : t.IsValueType ? Activator.CreateInstance(t) : null;

    private static object? Convert(Type target, object? raw, Ctx partials, List<string> chain)
    {
        if (raw is null) return null;
        var t = Nullable.GetUnderlyingType(target) ?? target;
        if (typeof(IComponent).IsAssignableFrom(t)) return Single(raw, partials, chain);
        if (t == typeof(string)) return raw is string s ? s : raw.ToString();
        if (t == typeof(object)) return raw;
        if (t == typeof(bool)) return bool.TryParse(raw.ToString(), out var b) && b;
        if (t == typeof(int)) return int.TryParse(raw.ToString(), out var i) ? i : 0;
        if (t == typeof(long)) return long.TryParse(raw.ToString(), out var l) ? l : 0L;
        if (t == typeof(double)) return double.TryParse(raw.ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var d) ? d : 0d;
        if (t == typeof(decimal)) return decimal.TryParse(raw.ToString(), System.Globalization.NumberStyles.Float, System.Globalization.CultureInfo.InvariantCulture, out var m) ? m : 0m;
        if (t == typeof(DateOnly)) return DateOnly.Parse(raw.ToString()!, System.Globalization.CultureInfo.InvariantCulture);
        if (t == typeof(DateTime)) return DateTime.Parse(raw.ToString()!, System.Globalization.CultureInfo.InvariantCulture);
        if (t.IsEnum) return Enum.TryParse(t, raw.ToString(), true, out var e) ? e : null;
        if (raw is IDictionary<object, object> dict)
        {
            if (t.IsGenericType && t.GetGenericArguments().Length == 2)
                return dict.Where(x => x.Key is string).ToDictionary(x => (string)x.Key, x => (object?)x.Value);
            return t.IsClass ? ObjectOf(t, dict, partials, chain) : null;
        }
        var elem = t.IsArray ? t.GetElementType()
            : t.IsGenericType && t.GetGenericArguments().Length == 1 ? t.GetGenericArguments()[0] : null;
        if (elem is not null && raw is IEnumerable<object> items)
        {
            var list = (System.Collections.IList)Activator.CreateInstance(typeof(List<>).MakeGenericType(elem))!;
            foreach (var item in items)
            {
                if (typeof(IComponent).IsAssignableFrom(elem))
                    foreach (var c in InList(item, partials, chain)) list.Add(c);
                else if (Convert(elem, item, partials, chain) is { } v) list.Add(v);
            }
            return list;
        }
        return null;
    }

    /// <summary>A <c>type: Form</c> node: a page with a declared header (title, subtitle,
    /// overline, titlePlaceholder, timestamp, badges, kpis, peerNav, recordSwitcher, banners, fabs)
    /// over its content (mirrors Java's fluent Form as YamlUidlLoader reads it). Every header key is
    /// optional; an absent one leaves its wire field null / empty.</summary>
    private static Form BuildForm(IDictionary<object, object> map, Ctx partials, List<string> chain) => new()
    {
        Id = Str(map, "id"),
        Style = Str(map, "style"),
        CssClasses = Str(map, "cssClasses"),
        Title = Str(map, "title"),
        Subtitle = Str(map, "subtitle"),
        NoHeader = Bool(map, "noHeader"),
        Content = Children(map, partials, chain),
        Toolbar = Maps(map, "toolbar").Select(FormButton).ToList(),
        Buttons = Maps(map, "buttons").Select(FormButton).ToList(),
        Overline = Str(map, "overline"),
        TitlePlaceholder = Str(map, "titlePlaceholder"),
        Timestamp = Str(map, "timestamp"),
        Badges = Maps(map, "badges").Select(b => new Chip { Label = Str(b, "label"), Color = Str(b, "color") }).ToList(),
        Kpis = Maps(map, "kpis").Select(k => new Fact { Label = Str(k, "label"), Value = Str(k, "value") }).ToList(),
        PeerNav = map.TryGetValue("peerNav", out var pn) && pn is IDictionary<object, object> peer
            ? new PeerNav(Str(peer, "prevLabel"), Str(peer, "prevRoute"), Str(peer, "nextLabel"), Str(peer, "nextRoute"))
            : null,
        RecordSwitcher = map.TryGetValue("recordSwitcher", out var rs) && rs is IDictionary<object, object> sw
            ? new RecordSwitcher(
                OptionsOf(sw),
                Str(sw, "value"),
                string.Equals(Str(sw, "type"), "context", StringComparison.OrdinalIgnoreCase)
                    ? SwitcherType.Context : SwitcherType.Object,
                Str(sw, "label"),
                Bool(sw, "searchable"),
                Bool(sw, "disabled"))
            {
                OptionsSource = SourceOf(sw, "optionsSource"),
                Route = Str(sw, "route"),
                ActionId = Str(sw, "actionId"),
            }
            : null,
        Banners = Maps(map, "banners").Select(b => new PageBanner(ThemeOf(Str(b, "theme")), Str(b, "title"), Str(b, "description"))
        {
            Closeable = Bool(b, "closeable"),
            TimeoutSeconds = int.TryParse(Str(b, "timeoutSeconds"), out var t) ? t : 0,
        }).ToList(),
        Fabs = Maps(map, "fabs").Select(f => new PageFab
        {
            Icon = Str(f, "icon"),
            Label = Str(f, "label"),
            ActionId = Str(f, "actionId") ?? "",
            Order = int.TryParse(Str(f, "order"), out var o) ? o : 0,
            ButtonStyle = Str(f, "buttonStyle"),
        }).ToList(),
    };

    private static Button FormButton(IDictionary<object, object> b) =>
        new(Str(b, "label") ?? "", Str(b, "actionId") ?? "")
        {
            ButtonStyle = Str(b, "buttonStyle"),
            Disabled = Bool(b, "disabled"),
            Route = RouteLinkOf(b),
        };

    /// <summary>The route of a button whose <c>actionable:</c> is a <c>RouteLink</c> (Java's
    /// ButtonMapper.routeOf): the button navigates instead of running an action. Null otherwise.</summary>
    private static string? RouteLinkOf(IDictionary<object, object> button) =>
        button.TryGetValue("actionable", out var a) && a is IDictionary<object, object> actionable
        && Str(actionable, "type") == "RouteLink"
            ? Str(actionable, "route")
            : null;

    /// <summary>A <c>type: Listing</c> node (Java's fluent Listing as YamlUidlLoader reads it):
    /// title, the smart search bar (<c>searchable</c>, <c>filters</c>), the <c>columns</c>
    /// (<c>type: GridColumn</c> nodes, field types already resolved) and the <c>rowsSource</c> — a
    /// catalogue <c>ref</c> or an inline endpoint — the renderer fetches the rows from.</summary>
    private static ListingComponent BuildListing(IDictionary<object, object> map, Ctx partials, List<string> chain) => new()
    {
        Id = Str(map, "id"),
        Style = Str(map, "style"),
        CssClasses = Str(map, "cssClasses"),
        Title = Str(map, "title"),
        Subtitle = Str(map, "subtitle"),
        Searchable = Bool(map, "searchable"),
        PageSize = int.TryParse(Str(map, "pageSize"), out var size) ? size : 0,
        GridLayout = Str(map, "gridLayout"),
        Compact = Bool(map, "compact"),
        EmptyStateMessage = Str(map, "emptyStateMessage"),
        Columns = Maps(map, "columns").Select(c => partials.Types.Resolve(c)).Select(c => new ListingColumn(Str(c, "id") ?? "", Str(c, "label") ?? Str(c, "id") ?? "")
        {
            DataType = Str(c, "dataType"),
            Stereotype = Str(c, "stereotype"),
            Sortable = Bool(c, "sortable"),
            Identifier = Bool(c, "identifier"),
            Width = Str(c, "width"),
            Align = Str(c, "align"),
            Tones = TonesOf(c),
        }).ToList(),
        Filters = Maps(map, "filters").Select(f => Build(f, partials, chain)).OfType<FormField>().ToList(),
        RowsSource = SourceOf(map, "rowsSource"),
    };

    private static IEnumerable<IDictionary<object, object>> Maps(IDictionary<object, object> map, string key) =>
        map.TryGetValue(key, out var v) && v is IEnumerable<object> seq
            ? seq.OfType<IDictionary<object, object>>()
            : [];

    private static List<Option> OptionsOf(IDictionary<object, object> map) =>
        map.TryGetValue("options", out var o) && o is IEnumerable<object> options
            ? options.Select(opt => opt is IDictionary<object, object> m
                    ? new Option(Str(m, "value") ?? "", Str(m, "label") ?? Str(m, "value") ?? "")
                    : new Option(opt?.ToString() ?? "", opt?.ToString() ?? ""))
                .ToList()
            : [];

    /// <summary>A status column's <c>tones:</c> map (value → tone), or null.</summary>
    private static IReadOnlyDictionary<string, string>? TonesOf(IDictionary<object, object> column) =>
        column.TryGetValue("tones", out var t) && t is IDictionary<object, object> tones
            ? tones.Where(e => e.Key is string && e.Value is not null)
                .ToDictionary(e => (string)e.Key, e => e.Value!.ToString()!)
            : null;

    /// <summary>A <c>{ref, url, itemsPath, valuePath, labelPath, …}</c> node (or a bare name, the
    /// ref shorthand) as a RestDataSource.</summary>
    private static RestDataSource? SourceOf(IDictionary<object, object> map, string key)
    {
        if (!map.TryGetValue(key, out var raw)) return null;
        return raw switch
        {
            string s when !string.IsNullOrWhiteSpace(s) => RestDataSource.OfRef(s),
            IDictionary<object, object> m => new RestDataSource
            {
                Ref = Str(m, "ref")?.Trim() ?? "",
                Url = Str(m, "url"),
                Method = Str(m, "method"),
                Body = Str(m, "body"),
                ItemsPath = Str(m, "itemsPath"),
                ValuePath = Str(m, "valuePath"),
                LabelPath = Str(m, "labelPath"),
                Proxy = Bool(m, "proxy"),
            },
            _ => null,
        };
    }

    private static BannerTheme ThemeOf(string? theme) =>
        Enum.TryParse<BannerTheme>(theme, ignoreCase: true, out var t) ? t : BannerTheme.Info;

    private static IReadOnlyList<IComponent> Children(
        IDictionary<object, object> map, Ctx partials, List<string> chain)
    {
        if (!map.TryGetValue("content", out var content) || content is not IEnumerable<object> seq)
            return [];
        // SelectMany, not Select: a partial standing for several components splices into the
        // parent's content rather than nesting, or a form grid would put them all in one cell.
        return seq.SelectMany(child => InList(child, partials, chain)).ToList();
    }

    private static string? Str(IDictionary<object, object> map, string key)
        => map.TryGetValue(key, out var v) ? v?.ToString() : null;

    private static bool Bool(IDictionary<object, object> map, string key, bool def = false)
    {
        var s = Str(map, key);
        return s is null ? def : s.Equals("true", StringComparison.OrdinalIgnoreCase);
    }
}
