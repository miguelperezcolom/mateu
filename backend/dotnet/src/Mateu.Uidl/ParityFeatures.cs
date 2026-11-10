namespace Mateu.Uidl;

// The declarative surface closed for 3.0 GA (2026-11-10): each attribute / interface mirrors a Java
// annotation / interface the .NET port could not express until then, emitting the same wire. Each
// one is pinned by a conformance case (conformance/cases/<case>).

// ── Page blocks: avatar, header, footer (page-decorations, page-decorations-supplied) ───────────

/// <summary>A component property shown as the PAGE's avatar (<c>PageDto.avatar</c>), never in the
/// form body. (C# analogue of io.mateu.uidl.annotations.Avatar.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class AvatarAttribute : Attribute;

/// <summary>A component property shown in the page's header block (<c>PageDto.header</c>), never in
/// the form body. (C# analogue of io.mateu.uidl.annotations.Header.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class HeaderAttribute : Attribute;

/// <summary>A component property shown in the page's footer block (<c>PageDto.footer</c>), never in
/// the form body. (C# analogue of io.mateu.uidl.annotations.Footer.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class FooterAttribute : Attribute;

/// <summary>Supplies the page's header block in code; wins over [Header] properties. (C# analogue
/// of io.mateu.uidl.interfaces.HeaderSupplier.)</summary>
public interface IHeaderSupplier
{
    IReadOnlyList<IComponent> Header();
}

/// <summary>Supplies the page's footer block in code; wins over [Footer] properties. (C# analogue
/// of io.mateu.uidl.interfaces.FooterSupplier.)</summary>
public interface IFooterSupplier
{
    IReadOnlyList<IComponent> Footer();
}

/// <summary>Supplies the page's avatar in code; wins over an [Avatar] property. (C# analogue of
/// io.mateu.uidl.interfaces.AvatarSupplier.)</summary>
public interface IAvatarSupplier
{
    IComponent? Avatar();
}

/// <summary>Supplies the page's overline (the line above the title) per request; wins over
/// [Overline]. (C# analogue of io.mateu.uidl.interfaces.OverlineSupplier.)</summary>
public interface IOverlineSupplier
{
    string? Overline();
}

/// <summary>Supplies what the header shows while the title is empty; wins over [TitlePlaceholder].
/// (C# analogue of io.mateu.uidl.interfaces.TitlePlaceholderSupplier.)</summary>
public interface ITitlePlaceholderSupplier
{
    string? TitlePlaceholder();
}

// ── Listing columns (listing-column-options) ────────────────────────────────────────────────────

/// <summary>A fixed width for the property's column (any CSS length), or "auto" to size it to its
/// content. (C# analogue of io.mateu.uidl.annotations.ColumnWidth.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class ColumnWidthAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

/// <summary>The column's priority when the listing must drop columns (lower = kept longer);
/// <see cref="Identifier"/> marks the column that names the row. (C# analogue of
/// io.mateu.uidl.annotations.Priority.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class PriorityAttribute(int value) : Attribute
{
    public int Value { get; } = value;
    public bool Identifier { get; init; }
}

/// <summary>The line of a list/card row the column is drawn on. (C# analogue of
/// io.mateu.uidl.annotations.Line.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class LineAttribute(int value) : Attribute
{
    public int Value { get; } = value;
}

// ── Presentation (field-decorations) ────────────────────────────────────────────────────────────

/// <summary>Inline CSS: on a class, the page component's style; on a property, the field's (and its
/// wrapper's) style or a listing column's. (C# analogue of io.mateu.uidl.annotations.Style.)</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property)]
public sealed class StyleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

/// <summary>CSS classes of the page component (on a class). (C# analogue of
/// io.mateu.uidl.annotations.CssClasses.)</summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Property)]
public sealed class CssClassesAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

/// <summary>The style of the div around a field (its <c>divStyle</c> attribute). (C# analogue of
/// io.mateu.uidl.annotations.DivStyle.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class DivStyleAttribute(string value) : Attribute
{
    public string Value { get; } = value;
}

/// <summary>Lays a field's options (radio buttons, checkboxes) out in <see cref="Columns"/>
/// columns. (C# analogue of io.mateu.uidl.annotations.OptionsLayout.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class OptionsLayoutAttribute : Attribute
{
    public int Columns { get; init; } = 1;
}

/// <summary>A string property shown as a compact inline notice: its VALUE is the text, a null or
/// blank value hides it. (C# analogue of the io.mateu.uidl.annotations.Notice field marker.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class NoticeAttribute : Attribute
{
    public string Theme { get; init; } = "info";
    public string Icon { get; init; } = "";
    public bool Slim { get; init; }
    public bool FullWidth { get; init; }
    public string ActionLabel { get; init; } = "";
    public string ActionId { get; init; } = "";
}

// ── Class-level rules and validations (class-rules) ─────────────────────────────────────────────

/// <summary>A client-side rule declared on the class (repeatable). (C# analogue of
/// io.mateu.uidl.annotations.Rule.)</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class RuleAttribute(string filter, string action, string fieldName, string fieldAttribute,
    string expression) : Attribute
{
    public string Filter { get; } = filter;
    public string Action { get; } = action;
    public string FieldName { get; } = fieldName;
    public string FieldAttribute { get; } = fieldAttribute;
    public string Expression { get; } = expression;
    public string Value { get; init; } = "";
    public string ActionId { get; init; } = "";
    public string Result { get; init; } = "Continue";
}

/// <summary>A cross-field client-side validation declared on the class (repeatable): while
/// <see cref="Condition"/> is falsy the form cannot be submitted and <see cref="Message"/> shows on
/// <see cref="FieldId"/>. (C# analogue of io.mateu.uidl.annotations.Validation — named FormValidation
/// so it never collides with System.ComponentModel.DataAnnotations.ValidationAttribute.)</summary>
[AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
public sealed class FormValidationAttribute(string condition, string fieldId, string message) : Attribute
{
    public string Condition { get; } = condition;
    public string FieldId { get; } = fieldId;
    public string Message { get; } = message;
}

// ── Row value mapping (listing-mapped-values) ───────────────────────────────────────────────────

/// <summary>The tone of a status chip. (C# analogue of io.mateu.uidl.data.StatusType.)</summary>
public enum StatusType { None, Info, Success, Warning, Danger }

/// <summary>A row property shown as a status chip: its value is mapped by the [StatusMapping]s on
/// the same property, else <see cref="DefaultStatus"/>. (C# analogue of
/// io.mateu.uidl.annotations.Status.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class StatusAttribute(StatusType defaultStatus = StatusType.None) : Attribute
{
    public StatusType DefaultStatus { get; } = defaultStatus;
}

/// <summary>One value → tone of a [Status] property (repeatable).</summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = true)]
public sealed class StatusMappingAttribute(string from, StatusType to) : Attribute
{
    public string From { get; } = from;
    public StatusType To { get; } = to;
}

/// <summary>A row property whose value is shown MAPPED: by the [ValueMapping]s on the same
/// property, else <see cref="DefaultValue"/>. (C# analogue of io.mateu.uidl.annotations.MappedValue.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class MappedValueAttribute(string defaultValue) : Attribute
{
    public string DefaultValue { get; } = defaultValue;
}

/// <summary>One value → text of a [MappedValue] property (repeatable).</summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = true)]
public sealed class ValueMappingAttribute(string from, string to) : Attribute
{
    public string From { get; } = from;
    public string To { get; } = to;
}

// ── Generated and create-only values (crud-generated-new / -edit) ───────────────────────────────

/// <summary>Produces a value for a [GeneratedValue] property of a creation form. Resolved from the
/// app's services when registered, else created with its parameterless constructor. (C# analogue
/// of io.mateu.uidl.interfaces.ValueGenerator.)</summary>
public interface IValueGenerator
{
    object? Generate();
}

/// <summary>A property the SERVER generates: read-only, and a creation form starts with the value
/// the <see cref="Generator"/> (an <see cref="IValueGenerator"/>) produces. (C# analogue of
/// io.mateu.uidl.annotations.GeneratedValue.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class GeneratedValueAttribute(Type generator) : Attribute
{
    public Type Generator { get; } = generator;
}

/// <summary>A property editable on the creation form only: read-only on an edit, and an edit's save
/// keeps the stored value. (C# analogue of io.mateu.uidl.annotations.EditableOnlyWhenCreating.)</summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class EditableOnlyWhenCreatingAttribute : Attribute;

// ── Wizards (wizard-labels) ─────────────────────────────────────────────────────────────────────

/// <summary>The words of a wizard's built-in Back and Next buttons. (C# analogue of
/// io.mateu.uidl.annotations.WizardLabels.)</summary>
[AttributeUsage(AttributeTargets.Class)]
public sealed class WizardLabelsAttribute : Attribute
{
    public string Back { get; init; } = "";
    public string Next { get; init; } = "";
}
