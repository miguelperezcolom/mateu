namespace Mateu.Uidl;

// ── Field type catalogue (C# mirror of io.mateu.uidl.data.FieldTypeEntry / FieldTypeCatalog) ─────

/// <summary>
/// One named FIELD TYPE of the app's domain vocabulary (<c>specs/ui/types.yaml</c>): what a domain
/// concept — an order status, an amount of money, an e-mail — looks like as a field or a column,
/// declared ONCE so no page has to repeat its data type, stereotype, options, limits and format.
/// A FormField or a GridColumn references it with <c>fieldType: &lt;id&gt;</c>; the type's attributes
/// are DEFAULTS and the field's own attributes win. Every attribute is optional: an absent (null)
/// one supplies nothing. (Mirrors io.mateu.uidl.data.FieldTypeEntry — the property names, camel-cased,
/// ARE the authored YAML keys.)
/// </summary>
public sealed record FieldTypeEntry(string Id)
{
    public string? Label { get; init; }
    public string? DataType { get; init; }
    public string? Stereotype { get; init; }
    public string? Placeholder { get; init; }
    public string? Description { get; init; }
    public bool? Required { get; init; }
    public bool? ReadOnly { get; init; }
    public IReadOnlyList<Option>? Options { get; init; }
    public RestDataSource? OptionsSource { get; init; }
    public double? Min { get; init; }
    public double? Max { get; init; }
    public double? Step { get; init; }
    public int? Colspan { get; init; }
    public string? Style { get; init; }
    public string? CssClasses { get; init; }
    public string? Align { get; init; }
    public string? Width { get; init; }
    public bool? AutoWidth { get; init; }

    /// <summary>A status column's badge tone per VALUE (<c>OPEN: warning</c>) — success | warning |
    /// danger | info | neutral. A value not listed keeps the default reading of the word.</summary>
    public IReadOnlyDictionary<string, string>? Tones { get; init; }

    /// <summary>A type with just a data type and a stereotype — the common case, for code suppliers.</summary>
    public static FieldTypeEntry Of(string id, string? dataType, string? stereotype = null) =>
        new(id) { DataType = dataType, Stereotype = stereotype };
}

/// <summary>The catalogue of field types. Authored (types.yaml) merges OVER the code suppliers, keyed
/// by id, and an authored entry REPLACES the supplied one outright. (Mirrors
/// io.mateu.uidl.data.FieldTypeCatalog.)</summary>
public sealed record FieldTypeCatalog(IReadOnlyList<FieldTypeEntry> Types)
{
    public static readonly FieldTypeCatalog Empty = new([]);

    public bool HasNoTypes() => Types.Count == 0;

    public FieldTypeEntry? Get(string? id) =>
        string.IsNullOrWhiteSpace(id) ? null : Types.FirstOrDefault(t => t.Id == id.Trim());

    public FieldTypeCatalog MergedOver(FieldTypeCatalog? derived)
    {
        var byId = new Dictionary<string, FieldTypeEntry>();
        var order = new List<string>();
        foreach (var t in (derived?.Types ?? []).Concat(Types))
        {
            if (!byId.ContainsKey(t.Id)) order.Add(t.Id);
            byId[t.Id] = t;
        }
        return new FieldTypeCatalog(order.Select(id => byId[id]).ToList());
    }
}

/// <summary>Implemented by a class (discovered in the scanned assemblies, parameterless constructor)
/// that contributes field types IN CODE. Its entries are the derived half: an entry of the same id
/// in <c>specs/ui/types.yaml</c> wins. (Mirrors Java's FieldTypeCatalogSupplier.)</summary>
public interface IFieldTypeCatalogSupplier
{
    IReadOnlyList<FieldTypeEntry> FieldTypes();
}

/// <summary>Names the field type (<c>specs/ui/types.yaml</c> / <see cref="IFieldTypeCatalogSupplier"/>)
/// a property of a listing's ROW class stands for: the reflected column takes the type's label, data
/// type, stereotype, width and tones as defaults — the property's own attributes ([Label], a
/// stereotype attribute) still win. The code-first counterpart of a YAML column's
/// <c>fieldType:</c>. (.NET-only: Java's reflected columns do not read the catalogue.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class FieldTypeAttribute(string id) : Attribute
{
    public string Id { get; } = id;
}
