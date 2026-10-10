using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// REST data sources (Java: RestSourceResolver + the @RestOptions/@RestListing/@RestAction/@RestData readers).
public sealed partial class ReflectionMapper
{
    /// <summary>The client-side external options descriptor when the property carries [RestOptions]
    /// (headers parsed from "Name: Value" strings); null otherwise. By reference (Source set) the
    /// default value/label paths are left blank so the catalogue entry's apply (Java's
    /// FieldMetadataExtractor) — an explicitly set path still wins.</summary>
    private static RestDataSourceDto? RestOptionsOf(PropertyInfo p)
    {
        if (p.Find<RestOptionsAttribute>() is not { } a) return null;
        var byRef = a.Source.Length > 0;
        return new RestDataSourceDto(a.Url)
        {
            Ref = byRef ? a.Source.Trim() : null,
            Method = DeclaredMethod(a.Source, a.Method, "GET"),
            Headers = ParseHeaders(a.Headers),
            Body = a.Body,
            ItemsPath = a.ItemsPath,
            ValuePath = byRef && a.ValuePath == "value" ? "" : a.ValuePath,
            LabelPath = byRef && a.LabelPath == "label" ? "" : a.LabelPath,
            Proxy = a.Proxy,
        };
    }

    /// <summary>The client-side external rows descriptor when the listing class carries
    /// [RestListing] (columns come from the row type; each item is keyed by column id); null
    /// otherwise.</summary>
    private static RestDataSourceDto? RestListingOf(Type type)
    {
        if (type.Find<RestListingAttribute>() is not { } a) return null;
        return new RestDataSourceDto(a.Url)
        {
            Ref = a.Source.Length > 0 ? a.Source.Trim() : null,
            Method = DeclaredMethod(a.Source, a.Method, "GET"),
            Headers = ParseHeaders(a.Headers),
            Body = a.Body,
            ItemsPath = a.ItemsPath,
            Proxy = a.Proxy,
        };
    }

    /// <summary>The client-side REST descriptor when a button method carries [RestAction]; null
    /// otherwise — the button then dispatches to the Mateu server as usual.</summary>
    private static RestActionDto? RestActionOf(MethodInfo m)
    {
        if (m.Find<RestActionAttribute>() is not { } a) return null;
        var source = new RestDataSourceDto(a.Url)
        {
            Ref = a.Source.Length > 0 ? a.Source.Trim() : null,
            Method = DeclaredMethod(a.Source, a.Method, "POST"),
            Headers = ParseHeaders(a.Headers),
            Body = a.Body,
            Proxy = a.Proxy,
        };
        return new RestActionDto(source,
            a.SuccessMessage.Length > 0 ? a.SuccessMessage : null,
            a.ResultPath.Length > 0 ? a.ResultPath : null);
    }

    /// <summary>The client-side REST descriptor for a [RestData] screen (silent load; blank
    /// ResultPath merges the whole response — getByPath with an empty path is identity); null
    /// when the class carries no [RestData].</summary>
    private static RestActionDto? RestDataOf(Type type)
    {
        if (type.Find<RestDataAttribute>() is not { } a) return null;
        var source = new RestDataSourceDto(a.Url)
        {
            Ref = a.Source.Length > 0 ? a.Source.Trim() : null,
            Method = DeclaredMethod(a.Source, a.Method, "GET"),
            Headers = ParseHeaders(a.Headers),
            Body = a.Body,
            Proxy = a.Proxy,
        };
        return new RestActionDto(source, null, a.ResultPath);
    }

    /// <summary>The method an attribute really declares: by reference, the attribute default means
    /// "the catalogue entry's" (blank) — otherwise a by-ref DELETE entry would be called with the
    /// default POST (Java's DeclaredRestMethod).</summary>
    private static string DeclaredMethod(string source, string method, string attributeDefault) =>
        source.Length > 0 && string.Equals(method, attributeDefault, StringComparison.OrdinalIgnoreCase) ? "" : method;

    /// <summary>Every source a view declares, as declared (a reference unresolved): its attributes
    /// and, for an <see cref="IRestSourceSupplier"/> view, what it supplies at runtime.</summary>
    private static IEnumerable<RestDataSourceDto> DeclaredSources(Type type, object? instance)
    {
        if (RestListingOf(type) is { } rows) yield return rows;
        if (RestDataOf(type)?.Source is { } data) yield return data;
        foreach (var p in type.GetProperties())
            if (RestOptionsOf(p) is { } options) yield return options;
        foreach (var m in type.GetMethods())
            if (RestActionOf(m)?.Source is { } action) yield return action;
        if (instance is IRestSourceSupplier supplier)
            foreach (var d in supplier.DeclaredRestSources() ?? [])
                if (d?.Source is { } s) yield return MateuCatalogs.ToDto(s);
    }

    /// <summary>True when the view declares at least one proxy-mode REST source — read off the
    /// RESOLVED source, so a by-ref surface whose catalogue entry says proxy counts — from its
    /// attributes or its <see cref="IRestSourceSupplier"/> declarations. Gates advertising the
    /// __restfetch__ action so only proxy views carry it.</summary>
    internal static bool HasProxySource(Type type, object? instance = null) =>
        DeclaredSources(type, instance).Any(s => MateuCatalogs.Resolved(s)!.Proxy);

    /// <summary>Resolves the DECLARED source of a view for a proxy fetch — what an
    /// <see cref="IRestSourceSupplier"/> view supplies first, then the property ([RestOptions]),
    /// class ([RestListing]/[RestData]) or method ([RestAction]) — with a catalogue reference
    /// resolved from the table the SERVER holds. Never a client-supplied url (so the proxy can't be
    /// turned into an open relay). Used by the __restfetch__ reserved action.</summary>
    internal static RestDataSourceDto? ResolveRestSource(Type type, object? instance, string? kind, string? id) =>
        MateuCatalogs.Resolved(SuppliedSource(instance, kind, id) ?? (kind switch
        {
            "options" => type.GetProperties().FirstOrDefault(p => p.Name == id || Naming.CamelCase(p.Name) == id) is { } p
                ? RestOptionsOf(p) : null,
            "rows" => RestListingOf(type),
            "action" => type.GetMethods().FirstOrDefault(m => m.Name == id || Naming.CamelCase(m.Name) == id) is { } m
                ? RestActionOf(m)?.Source : null,
            "data" => RestDataOf(type)?.Source,
            _ => null,
        }));

    /// <summary>What an <see cref="IRestSourceSupplier"/> view declared for this kind and id (rows
    /// and data have one per view, so the id does not identify them); null otherwise.</summary>
    private static RestDataSourceDto? SuppliedSource(object? instance, string? kind, string? id)
    {
        if (instance is not IRestSourceSupplier supplier || RestSourceKinds.FromWire(kind) is not { } wanted)
            return null;
        var wantedId = id ?? "";
        var match = (supplier.DeclaredRestSources() ?? [])
            .FirstOrDefault(d => d?.Source is not null && d.Kind == wanted
                                 && (wanted is RestSourceKind.Rows or RestSourceKind.Data || d.Id == wantedId));
        return match is null ? null : MateuCatalogs.ToDto(match.Source);
    }

    /// <summary>Parses "Name: Value" header strings into a map.</summary>
    private static Dictionary<string, string> ParseHeaders(string[] headers) =>
        RestSourceRegistry.Pairs(headers, ':');
}
