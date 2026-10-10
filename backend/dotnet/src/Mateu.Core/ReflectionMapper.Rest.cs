using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

// REST data sources (Java: RestSourceResolver + the @RestOptions/@RestListing/@RestAction/@RestData readers).
public sealed partial class ReflectionMapper
{
    /// <summary>The client-side external options descriptor when the property carries [RestOptions]
    /// (headers parsed from "Name: Value" strings); null otherwise.</summary>
    private static RestDataSourceDto? RestOptionsOf(PropertyInfo p)
    {
        if (p.Find<RestOptionsAttribute>() is not { } a) return null;
        return new RestDataSourceDto(a.Url)
        {
            Method = a.Method,
            Headers = ParseHeaders(a.Headers),
            Body = a.Body,
            ItemsPath = a.ItemsPath,
            ValuePath = a.ValuePath,
            LabelPath = a.LabelPath,
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
            Method = a.Method,
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
            Method = a.Method,
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
            Method = a.Method,
            Headers = ParseHeaders(a.Headers),
            Body = a.Body,
            Proxy = a.Proxy,
        };
        return new RestActionDto(source, null, a.ResultPath);
    }

    /// <summary>True when the view declares at least one proxy-mode REST source (Proxy=true on a
    /// property [RestOptions], a method [RestAction], or the class [RestListing]/[RestData]). Gates
    /// advertising the __restfetch__ action so only proxy views carry it.</summary>
    internal static bool HasProxySource(Type type)
    {
        if (type.Find<RestListingAttribute>() is { Proxy: true }) return true;
        if (type.Find<RestDataAttribute>() is { Proxy: true }) return true;
        if (type.GetProperties().Any(p => p.Find<RestOptionsAttribute>() is { Proxy: true })) return true;
        return type.GetMethods().Any(m => m.Find<RestActionAttribute>() is { Proxy: true });
    }

    /// <summary>Resolves the DECLARED source of a view for a proxy fetch — from the property
    /// ([RestOptions]), the class ([RestListing]/[RestData]) or the method ([RestAction]), never
    /// from a client-supplied url (so the proxy can't be turned into an open relay). Used by the
    /// __restfetch__ reserved action.</summary>
    internal static RestDataSourceDto? ResolveRestSource(Type type, string? kind, string? id) => kind switch
    {
        "options" => type.GetProperties().FirstOrDefault(p => p.Name == id || Naming.CamelCase(p.Name) == id) is { } p
            ? RestOptionsOf(p) : null,
        "rows" => RestListingOf(type),
        "action" => type.GetMethods().FirstOrDefault(m => m.Name == id || Naming.CamelCase(m.Name) == id) is { } m
            ? RestActionOf(m)?.Source : null,
        "data" => RestDataOf(type)?.Source,
        _ => null,
    };

    /// <summary>Parses "Name: Value" header strings into a map.</summary>
    private static Dictionary<string, string> ParseHeaders(string[] headers)
    {
        var map = new Dictionary<string, string>();
        foreach (var h in headers)
        {
            var i = h.IndexOf(':');
            if (i > 0) map[h[..i].Trim()] = h[(i + 1)..].Trim();
        }
        return map;
    }
}
