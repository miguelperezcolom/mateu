namespace Mateu.Uidl;

// ── The last wire component types that used to be Java-only (3.0 parity) ──────────────────────
// Each is the C# analogue of the io.mateu.uidl.data record of the same name and maps to the same
// wire (ComponentMapper → MoreComponentMapper); a YAML node of the same `type:` builds it
// generically (Directory → DirectoryMenu, see its summary).

/// <summary>A dashboard board: <see cref="Rows"/> of <see cref="BoardLayoutItem"/>s, each spanning
/// <see cref="BoardLayoutItem.BoardCols"/> columns of its row. (C# analogue of
/// io.mateu.uidl.data.BoardLayout.)</summary>
public sealed record BoardLayout : ComponentBase
{
    public IReadOnlyList<BoardLayoutRow> Rows { get; init; } = [];
}

/// <summary>One row of a <see cref="BoardLayout"/> (its items travel as children).</summary>
public sealed record BoardLayoutRow : ComponentBase
{
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>One tile of a <see cref="BoardLayoutRow"/>: its <see cref="Content"/> spanning
/// <see cref="BoardCols"/> columns.</summary>
public sealed record BoardLayoutItem : ComponentBase
{
    public IComponent? Content { get; init; }
    public int BoardCols { get; init; }
}

/// <summary>A carousel of slides (the <see cref="Content"/>). Every flag defaults to off / 0, as
/// Java's builder leaves them; <see cref="Duration"/> is the autoplay interval in milliseconds.
/// (C# analogue of io.mateu.uidl.data.CarouselLayout.)</summary>
public sealed record CarouselLayout : ComponentBase
{
    public IReadOnlyList<IComponent> Content { get; init; } = [];
    public bool Alt { get; init; }
    public bool Animating { get; init; }
    public bool Auto { get; init; }
    public Orientation? Direction { get; init; }
    public bool Disabled { get; init; }
    public bool DisableSwipe { get; init; }
    public bool DisableKeys { get; init; }
    public int Duration { get; init; }
    public bool Dots { get; init; }
    public bool End { get; init; }
    public bool Loop { get; init; }
    public bool Nav { get; init; }
    public int Selected { get; init; }
    public int Total { get; init; }
}

/// <summary>An AI chat panel streaming from <see cref="SseUrl"/> (uploads to
/// <see cref="UploadUrl"/>). (C# analogue of io.mateu.uidl.data.Chat.)</summary>
public sealed record Chat(string? SseUrl) : ComponentBase
{
    public string? UploadUrl { get; init; }
}

/// <summary>A plain container around one component (an absent one is an empty Div). (C# analogue
/// of io.mateu.uidl.data.Container.)</summary>
public sealed record Container : ComponentBase
{
    public IComponent? Content { get; init; }
}

/// <summary>Stretches its <see cref="Content"/> across the full width. (C# analogue of
/// io.mateu.uidl.data.FullWidth.)</summary>
public sealed record FullWidth : ComponentBase
{
    public IComponent? Content { get; init; }
}

/// <summary>A scrollable area around its <see cref="Content"/> (give it a height in
/// <see cref="ComponentBase.Style"/>). (C# analogue of io.mateu.uidl.data.Scroller.)</summary>
public sealed record Scroller : ComponentBase
{
    public IComponent? Content { get; init; }
}

/// <summary>One labelled item of a form layout (its <see cref="Content"/> travels as children).
/// (C# analogue of io.mateu.uidl.data.FormItem.)</summary>
public sealed record FormItem : ComponentBase
{
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>A titled group inside a form section. (C# analogue of
/// io.mateu.uidl.data.FormSubSection.)</summary>
public sealed record FormSubSection(string? Title) : ComponentBase
{
    public IReadOnlyList<IComponent> Content { get; init; } = [];
}

/// <summary>A master pane and an optional detail pane (two children). (C# analogue of
/// io.mateu.uidl.data.MasterDetailLayout; like Java's mapper, the wire carries only the panes.)</summary>
public sealed record MasterDetailLayout(IComponent Master) : ComponentBase
{
    public IComponent? Detail { get; init; }

    /// <summary>How master and detail are laid out (Java's MasterDetailLayout.orientation; default
    /// horizontal: side by side).</summary>
    public Orientation Orientation { get; init; } = Orientation.Horizontal;
}

/// <summary>One entry of a <see cref="ContextMenu"/>, <see cref="DirectoryMenu"/> or
/// <see cref="MenuBar"/>: a <see cref="Label"/> (or a <see cref="Component"/> drawn instead) going
/// to <see cref="Path"/> (default: the label camel-cased, as in Java), with nested
/// <see cref="Submenu"/> entries. <see cref="Divider"/> is a separator. (C# analogue of Java's
/// RouteLink / Menu / MenuSeparator Actionables.)</summary>
public sealed record MenuOption(string Label)
{
    public string? Path { get; init; }
    public IComponent? Component { get; init; }
    public bool Selected { get; init; }
    public bool Disabled { get; init; }
    public bool DisabledOnClick { get; init; }
    public string? ClassName { get; init; }
    public object? ItemData { get; init; }
    public IReadOnlyList<MenuOption> Submenu { get; init; } = [];
    public bool Separator { get; init; }

    /// <summary>Picking the entry runs this action instead of navigating (Java's MethodLink).</summary>
    public string? ActionId { get; init; }

    /// <summary>A visual divider between entries.</summary>
    public static MenuOption Divider() => new("") { Path = "", ClassName = "", Separator = true };
}

/// <summary>A context menu over a <see cref="Wrapped"/> component (opened by a left click too when
/// <see cref="ActivateOnLeftClick"/>). (C# analogue of io.mateu.uidl.data.ContextMenu.)</summary>
public sealed record ContextMenu : ComponentBase
{
    public IReadOnlyList<MenuOption> Menu { get; init; } = [];
    public IComponent? Wrapped { get; init; }
    public bool ActivateOnLeftClick { get; init; }
}

/// <summary>A directory: a menu tree drawn as a page of links. The wire type is <c>Directory</c>
/// (and so is the YAML <c>type:</c>); the C# name differs only because <c>System.IO.Directory</c> is
/// in every project's implicit usings. (C# analogue of io.mateu.uidl.data.Directory.)</summary>
public sealed record DirectoryMenu : ComponentBase
{
    public IReadOnlyList<MenuOption> Menu { get; init; } = [];
}

/// <summary>A menu bar of <see cref="Options"/>. (C# analogue of io.mateu.uidl.fluent.MenuBar.)</summary>
public sealed record MenuBar : ComponentBase
{
    public IReadOnlyList<MenuOption> Options { get; init; } = [];
}

public enum CookieConsentPosition { Top, Bottom, TopLeft, TopRight, BottomLeft, BottomRight }

/// <summary>A cookie-consent banner. (C# analogue of io.mateu.uidl.data.CookieConsent.)</summary>
public sealed record CookieConsent : ComponentBase
{
    public CookieConsentPosition? Position { get; init; }
    public string? CookieName { get; init; }
    public string? Message { get; init; }
    public string? Theme { get; init; }
    public string? LearnMore { get; init; }
    public string? LearnMoreLink { get; init; }
    public string? Dismiss { get; init; }
}

/// <summary>A form designer editing its <see cref="Value"/> (a JSON form definition). (C#
/// analogue of io.mateu.uidl.data.FormEditor.)</summary>
public sealed record FormEditor(string? Value) : ComponentBase;

/// <summary>A workflow diagram editor over its <see cref="Value"/> (BPMN XML). (C# analogue of
/// io.mateu.uidl.data.Workflow.)</summary>
public sealed record Workflow(string? Value) : ComponentBase;

/// <summary>A "page not found" screen with a way back. (C# analogue of
/// io.mateu.uidl.data.NotFound.)</summary>
public sealed record NotFound : ComponentBase
{
    public string? Title { get; init; }
    public string? Message { get; init; }
    public string? BackRoute { get; init; }
    public string? BackLabel { get; init; }
}

/// <summary>One message of a <see cref="MessageList"/>.</summary>
public sealed record MessageListItem(string? Text, string? UserName)
{
    public string? Time { get; init; }
    public string? UserImg { get; init; }
    public string? UserAbbr { get; init; }
    public int? UserColorIndex { get; init; }
}

/// <summary>A list of chat messages (id defaults to "messageList", as in Java). (C# analogue of
/// io.mateu.uidl.data.MessageList.)</summary>
public sealed record MessageList : ComponentBase
{
    public IReadOnlyList<MessageListItem> Items { get; init; } = [];
}

/// <summary>A message box: sending runs <see cref="ActionId"/> (id defaults to "messageInput").
/// (C# analogue of io.mateu.uidl.data.MessageInput.)</summary>
public sealed record MessageInput(string? ActionId) : ComponentBase;

/// <summary>A virtualised list of components; <see cref="TotalElements"/> defaults to the count of
/// <see cref="Content"/>. (C# analogue of io.mateu.uidl.data.VirtualList over a Page.)</summary>
public sealed record VirtualList : ComponentBase
{
    public IReadOnlyList<IComponent> Content { get; init; } = [];
    public long? TotalElements { get; init; }
}

/// <summary>What a <see cref="Grid"/> holds: a <see cref="GridColumn"/> or a
/// <see cref="GridGroupColumn"/>.</summary>
public interface IGridContent : IComponent;

/// <summary>A column of a fluent <see cref="Grid"/>. <see cref="DataType"/> uses the wire names
/// (string, integer, number, money, bool, date…); the alignment defaults like Java's (numbers end,
/// booleans centre). (C# analogue of io.mateu.uidl.data.GridColumn.)</summary>
public sealed record GridColumn : ComponentBase, IGridContent
{
    public string? Label { get; init; }
    public string DataType { get; init; } = "string";
    public string Stereotype { get; init; } = "regular";
    public string? Align { get; init; }
    public bool Sortable { get; init; }
    public string? SortingProperty { get; init; }
    public bool Filterable { get; init; }
    public bool Frozen { get; init; }
    public bool FrozenToEnd { get; init; }
    public bool AutoWidth { get; init; }
    public string? FlexGrow { get; init; }
    public bool Resizable { get; init; }
    public string? Width { get; init; }
    public string? TooltipPath { get; init; }
    public string? ActionId { get; init; }
    public string? Text { get; init; }
    public string? CaptionPath { get; init; }
    public string? LeadingPath { get; init; }
    public int? Priority { get; init; }
    public bool Identifier { get; init; }
    public bool Editable { get; init; }
    public string? EditorType { get; init; }
    public IReadOnlyList<Option>? EditorOptions { get; init; }
    public double? Weight { get; init; }
    public string? Aggregate { get; init; }
    public int? Line { get; init; }
    public IReadOnlyDictionary<string, string>? Tones { get; init; }
    public IReadOnlyDictionary<string, string>? ValueLabels { get; init; }
}

/// <summary>A header spanning several <see cref="Columns"/> of a <see cref="Grid"/>. (C# analogue
/// of io.mateu.uidl.data.GridGroupColumn.)</summary>
public sealed record GridGroupColumn(string? Label) : ComponentBase, IGridContent
{
    public IReadOnlyList<GridColumn> Columns { get; init; } = [];
}

/// <summary>A fluent data table: its <see cref="Content"/> columns (and column groups) over
/// <see cref="Rows"/> (any objects — dictionaries, records — read by column id; null = no page sent)
/// with <see cref="TotalElements"/> defaulting to their count. (C# analogue of
/// io.mateu.uidl.data.Grid; a listing or grid FIELD is the declarative way to a table.)</summary>
public sealed record Grid : ComponentBase
{
    public IReadOnlyList<IGridContent> Content { get; init; } = [];
    public IReadOnlyList<object>? Rows { get; init; }
    public long? TotalElements { get; init; }
    public bool Tree { get; init; }
    public int Size { get; init; }
    public bool WrapCellContent { get; init; }
    public bool Compact { get; init; }
    public bool NoBorder { get; init; }
    public bool NoRowBorder { get; init; }
    public bool ColumnBorders { get; init; }
    public bool RowStripes { get; init; }
    public string? VaadinGridCellBackground { get; init; }
    public string? VaadinGridCellPadding { get; init; }
}
