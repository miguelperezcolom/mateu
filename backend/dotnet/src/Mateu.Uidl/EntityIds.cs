using System.Reflection;

namespace Mateu.Uidl;

/// <summary>Marks the property that identifies a crud/listing record when it is not called
/// <c>Id</c> — <c>[Id] public string Code { get; set; }</c>. The C# analogue of Java's
/// <c>Identifiable</c>: a property, so the framework can also read it from a grid row and write it
/// back on save.</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class IdAttribute : Attribute;

/// <summary>Which property identifies a record: the one marked <see cref="IdAttribute"/>, else
/// the public <c>Id</c> property. A crud whose entity has neither cannot open, edit or delete a
/// record, so <see cref="Require"/> refuses it with an error naming the fix instead of letting the
/// record ids silently come out null.</summary>
public static class EntityIds
{
    /// <summary>The id property of <paramref name="type"/>, or null when it declares none.</summary>
    public static PropertyInfo? PropertyOf(Type type)
    {
        var properties = type.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        return properties.FirstOrDefault(p => p.GetCustomAttribute<IdAttribute>(inherit: true) is not null)
               ?? properties.FirstOrDefault(p => p.Name == "Id");
    }

    /// <summary>The id property of <paramref name="type"/>; throws when it declares none.</summary>
    public static PropertyInfo Require(Type type) =>
        PropertyOf(type) ?? throw new InvalidOperationException(
            $"{type.Name} has no id: Mateu needs to know which property identifies a record. "
            + $"Name it Id, or mark it [Id] (e.g. [Id] public string Code {{ get; set; }}).");

    /// <summary>The name the id travels under in the component state and grid rows (camelCase).</summary>
    public static string FieldName(Type type)
    {
        var name = Require(type).Name;
        return char.ToLowerInvariant(name[0]) + name[1..];
    }

    /// <summary>The id of <paramref name="entity"/> as a string (null when the value is null).</summary>
    public static string? Of(object entity) =>
        Require(entity.GetType()).GetValue(entity)?.ToString();

    /// <summary>Writes the route id <paramref name="id"/> into <paramref name="entity"/>'s id
    /// property, converted to its type (string, numeric, Guid…).</summary>
    public static void SetId(object entity, string id)
    {
        var property = Require(entity.GetType());
        if (!property.CanWrite) return;
        var target = Nullable.GetUnderlyingType(property.PropertyType) ?? property.PropertyType;
        object value = target == typeof(string) ? id
            : target == typeof(Guid) ? Guid.Parse(id)
            : target.IsEnum ? Enum.Parse(target, id)
            : Convert.ChangeType(id, target, System.Globalization.CultureInfo.InvariantCulture);
        property.SetValue(entity, value);
    }
}
