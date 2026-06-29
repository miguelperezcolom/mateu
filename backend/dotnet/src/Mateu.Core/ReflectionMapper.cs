using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Turns an annotated C# view instance into the Mateu component tree (App→Page→Card→…→FormField).</summary>
public sealed class ReflectionMapper
{
    public ServerSideComponentDto MapView(Type type, object instance, string route)
    {
        var title = type.GetCustomAttribute<TitleAttribute>()?.Value ?? Naming.Humanize(type.Name);

        var fields = EditableProperties(type).Select(p => MapField(p, instance)).ToList();
        var buttons = type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)
            .Where(m => m.GetCustomAttribute<ButtonAttribute>() != null)
            .Select(MapButton).ToList();
        var actions = buttons.Select(b => new ActionDto(b.ActionId)).ToList();

        var formLayout = Client(new FormLayoutMetadataDto(), null, FormRows(fields));
        var vlayout = Client(new VerticalLayoutMetadataDto(), null, [formLayout]);
        var div = Client(new DivMetadataDto(), "fieldId", [vlayout]);
        var card = Client(new CardMetadataDto(div), "fieldId", []);
        var page = Client(new PageMetadataDto(title, title, null, [], buttons), null, [card]);

        return new ServerSideComponentDto(
            Guid.NewGuid().ToString(), type.FullName!, route,
            [page], new Dictionary<string, object?>(), actions, [], null, null, null);
    }

    internal static IEnumerable<PropertyInfo> EditableProperties(Type type) =>
        type.GetProperties(BindingFlags.Public | BindingFlags.Instance)
            .Where(p => p is { CanRead: true, CanWrite: true });

    private static ClientSideComponentDto MapField(PropertyInfo p, object instance)
    {
        var fieldId = Naming.CamelCase(p.Name);
        var label = p.GetCustomAttribute<LabelAttribute>()?.Value ?? Naming.Humanize(p.Name);
        var required = p.GetCustomAttribute<RequiredAttribute>() != null;
        var t = Nullable.GetUnderlyingType(p.PropertyType) ?? p.PropertyType;
        var options = t.IsEnum
            ? Enum.GetNames(t).Select(n => new OptionDto(n, Naming.Humanize(n))).ToList()
            : new List<OptionDto>();
        var value = p.GetValue(instance);

        var meta = new FormFieldMetadataDto(fieldId, InferDataType(t), label)
        {
            Required = required,
            Options = options,
            InitialValue = value is null ? null : value.ToString(),
        };
        return Client(meta, fieldId, []);
    }

    private static ButtonDto MapButton(MethodInfo m)
    {
        var label = m.GetCustomAttribute<ButtonAttribute>()?.Label
                    ?? m.GetCustomAttribute<LabelAttribute>()?.Value
                    ?? Naming.Humanize(m.Name);
        return new ButtonDto(label, Naming.CamelCase(m.Name));
    }

    // Group fields into FormRow components of at most `maxColumns` (here 2).
    private static List<ComponentDto> FormRows(List<ClientSideComponentDto> fields, int maxColumns = 2)
    {
        var rows = new List<ComponentDto>();
        for (var i = 0; i < fields.Count; i += maxColumns)
            rows.Add(Client(new FormRowMetadataDto(), null, fields.Skip(i).Take(maxColumns).Cast<ComponentDto>().ToList()));
        return rows;
    }

    private static ClientSideComponentDto Client(ComponentMetadataDto meta, string? id, IReadOnlyList<ComponentDto> children) =>
        new(meta, id, children, null, null, null);

    private static string InferDataType(Type t) => t switch
    {
        _ when t.IsEnum => "string",
        _ when t == typeof(bool) => "boolean",
        _ when t == typeof(byte) || t == typeof(short) || t == typeof(int) || t == typeof(long) => "integer",
        _ when t == typeof(float) || t == typeof(double) || t == typeof(decimal) => "number",
        _ when t == typeof(DateOnly) || t == typeof(DateTime) => "date",
        _ => "string",
    };
}
