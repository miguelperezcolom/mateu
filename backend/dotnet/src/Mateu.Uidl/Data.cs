namespace Mateu.Uidl;

public enum MessageVariant { Success, Info, Warning, Error }

/// <summary>A user-facing toast/alert an action can return. (C# analogue of io.mateu.uidl.data.Message.)</summary>
public sealed class Message(string text, MessageVariant variant = MessageVariant.Success, string title = "")
{
    public string Text { get; } = text;
    public MessageVariant Variant { get; } = variant;
    public string Title { get; } = title;
    public int Duration { get; init; } = 5000;
}

/// <summary>Navigation link rendered as an icon at the right side of a form field (see [LinkTo]
/// and <see cref="ILinkSupplier"/>). Href/Title may carry <c>${...}</c> expressions, interpolated
/// client-side against the live component state. (C# analogue of io.mateu.uidl.data.NavLink.)</summary>
public sealed record NavLink(string Href, string? Icon = null, string? Title = null, string? Target = null);

/// <summary>Implemented by a view to attach a navigation link icon to fields at runtime (an
/// alternative to the static [LinkTo] attribute, over which this takes precedence). Return the
/// <see cref="NavLink"/> for the property named <paramref name="memberName"/>, or null for no link
/// — a [LinkTo] on the property then applies if present. (C# analogue of Java's LinkSupplier.)</summary>
public interface ILinkSupplier
{
    NavLink? Link(string memberName);
}

/// <summary>A selectable option; Children makes it a node of a hierarchical option set
/// ([TreeSelect] fields). (C# analogue of Java's Option.)</summary>
public sealed record Option(string Value, string Label, IReadOnlyList<Option>? Children = null);

/// <summary>Supplies the fixed set of selectable options for a field (C# analogue of Java's
/// OptionsSupplier). Options may carry Children → hierarchical sets for [TreeSelect].</summary>
public interface IOptionsSupplier
{
    IReadOnlyList<Option> Options(string fieldName);
}
