using System.Text.RegularExpressions;
using Mateu.Dtos;
using Mateu.Uidl;

namespace Mateu.Core;

/// <summary>Maps the last component types that used to be Java-only (MoreComponents.cs) to the same
/// wire as Java's BoardLayoutMapper, CarouselLayoutMapper, ChatMapper, ContainerMapper,
/// ContextMenuMapper, CookieConsentMapper, DirectoryMapper, FormEditorMapper, FormItemMapper,
/// FormSubSectionMapper, FullWidthMapper, GridMapper (+ GridColumnMapper, GridGroupColumnMapper),
/// MasterDetailLayoutMapper, MenuBarMapper, MessageInputMapper, MessageListMapper, NotFoundMapper,
/// ScrollerMapper, VirtualListMapper and WorkflowMapper — ids included (Java hardcodes "fieldId",
/// "messageList", "messageInput" or null on several of them).</summary>
internal static class MoreComponentMapper
{
    /// <summary>The wire of a component of this family; null for any other component.</summary>
    public static ClientSideComponentDto? MapOrNull(IComponent component) => component switch
    {
        BoardLayout b => Client(new BoardLayoutMetadataDto(), b.Id, b.Rows.Select(Map), b),
        BoardLayoutRow r => Client(new BoardLayoutRowMetadataDto(), null, r.Content.Select(Map), r),
        BoardLayoutItem i => Client(new BoardLayoutItemMetadataDto(i.BoardCols), null,
            i.Content is null ? [] : [Map(i.Content)], i),
        CarouselLayout c => Client(new CarouselLayoutMetadataDto(c.Alt, c.Animating, c.Auto,
                c.Direction?.ToString().ToLowerInvariant(), c.Disabled, c.DisableSwipe, c.DisableKeys,
                c.Duration, c.Dots, c.End, c.Loop, c.Nav, c.Selected, c.Total),
            c.Id, c.Content.Select(Map), c),
        Chat ch => Client(new ChatMetadataDto(ch.SseUrl, ch.UploadUrl), "fieldId", [], ch),
        Container ct => Client(new ContainerMetadataDto(), null, [Slot(ct.Content)], ct),
        FullWidth fw => Client(new FullWidthMetadataDto(), null, [Slot(fw.Content)], fw),
        Scroller sc => Client(new ScrollerMetadataDto(), null, [Slot(sc.Content)], sc),
        FormItem fi => Client(new FormItemMetadataDto(), fi.Id, fi.Content.Select(Map), fi),
        FormSubSection fs => Client(new FormSubSectionMetadataDto(fs.Title), "fieldId", fs.Content.Select(Map), fs),
        MasterDetailLayout md => Client(new MasterDetailLayoutMetadataDto
            {
                Orientation = md.Orientation.ToString().ToLowerInvariant(),
            }, md.Id,
            md.Detail is null ? [Map(md.Master)] : [Map(md.Master), Map(md.Detail)], md),
        ContextMenu cm => Client(new ContextMenuMetadataDto(Menu(cm.Menu),
                cm.Wrapped is null ? null : Map(cm.Wrapped), cm.ActivateOnLeftClick),
            "fieldId", [], cm),
        DirectoryMenu dm => Client(new DirectoryMetadataDto(Menu(dm.Menu)), "fieldId", [], dm),
        // Java gives every menu bar a random id
        MenuBar mb => Client(new MenuBarMetadataDto(Menu(mb.Options)), mb.Id ?? Guid.NewGuid().ToString(), [], mb),
        CookieConsent cc => Client(new CookieConsentMetadataDto(cc.Position?.ToString(), cc.CookieName,
            cc.Message, cc.Theme, cc.LearnMore, cc.LearnMoreLink, cc.Dismiss), "fieldId", [], cc),
        FormEditor fe => Client(new FormEditorMetadataDto(fe.Value), "fieldId", [], fe),
        Workflow wf => Client(new WorkflowMetadataDto(wf.Value), "fieldId", [], wf),
        NotFound nf => Client(new NotFoundMetadataDto(nf.Title, nf.Message, nf.BackRoute, nf.BackLabel), nf.Id, [], nf),
        MessageList ml => Client(new MessageListMetadataDto(ml.Items.Select(m =>
                new MessageListItemDto(m.Text, m.UserName, m.Time, m.UserImg, m.UserAbbr, m.UserColorIndex)).ToList()),
            ml.Id ?? "messageList", [], ml),
        MessageInput mi => Client(new MessageInputMetadataDto(mi.ActionId), mi.Id ?? "messageInput", [], mi),
        VirtualList vl => Client(new VirtualListMetadataDto(new DataPageDto(
                vl.Content.Select(c => Map(c)).Select(d =>
                    (object)new DataPageComponentDto(d.Metadata, d.Id, d.Children, d.Style, d.CssClasses, d.Slot)).ToList(), vl.TotalElements ?? vl.Content.Count)),
            "fieldId", [], vl),
        Grid g => Client(new GridMetadataDto(
                g.Content.Select(c => (ComponentDto)Map(c)).ToList(),
                g.Rows is null ? null : new DataPageDto(g.Rows, g.TotalElements ?? g.Rows.Count),
                g.Tree, g.Size, g.WrapCellContent, g.Compact, g.NoBorder, g.NoRowBorder, g.ColumnBorders,
                g.RowStripes, g.VaadinGridCellBackground, g.VaadinGridCellPadding),
            g.Id, [], g),
        GridColumn col => Client(ColumnOf(col), col.Id, [], col),
        GridGroupColumn gc => Client(new GridGroupColumnMetadataDto(gc.Id, gc.Label, gc.Style, gc.CssClasses,
            gc.Columns.Select(c => (ComponentDto)Map(c)).ToList()), gc.Id, [], gc),
        _ => null,
    };

    private static ClientSideComponentDto Map(IComponent c) => ComponentMapper.Map(c);

    /// <summary>A single-child slot: an absent child is an empty Div (Java's Children.orEmptySlot).</summary>
    private static ComponentDto Slot(IComponent? child) =>
        child is null ? new ClientSideComponentDto(new DivMetadataDto(), "fieldId", [], null, null, null) : Map(child);

    private static ClientSideComponentDto Client(ComponentMetadataDto meta, string? id,
        IEnumerable<ComponentDto> children, ComponentBase c) =>
        new(meta, id, children.ToList(), c.Style, c.CssClasses, null);

    /// <summary>Java's GridColumnMapper: numbers and money align end, booleans centre; a column with
    /// no fixed width sizes to its content; only a line &gt; 1, a set priority and non-empty
    /// tones/labels travel.</summary>
    private static GridColumnComponentMetadataDto ColumnOf(GridColumn c) => new(c.Id, c.Label)
    {
        Align = c.Align ?? (c.DataType is "integer" or "number" or "money" || c.Stereotype == "money" ? "end"
            : c.DataType == "bool" ? "center" : null),
        DataType = c.DataType,
        Stereotype = c.Stereotype,
        AutoWidth = c.AutoWidth || c.Width is null,
        CssClasses = c.CssClasses,
        Filterable = c.Filterable,
        FlexGrow = c.FlexGrow,
        Frozen = c.Frozen,
        FrozenToEnd = c.FrozenToEnd,
        Resizable = c.Resizable,
        Sortable = c.Sortable,
        SortingProperty = c.SortingProperty,
        Width = c.Width,
        TooltipPath = c.TooltipPath,
        ActionId = c.ActionId,
        Text = c.Text,
        CaptionPath = c.CaptionPath,
        LeadingPath = c.LeadingPath,
        Style = c.Style,
        Priority = c.Priority,
        Identifier = c.Identifier,
        Editable = c.Editable,
        EditorType = c.EditorType,
        EditorOptions = c.EditorOptions?.Select(o => new OptionDto(o.Value, o.Label)).ToList(),
        Weight = c.Weight,
        Aggregate = c.Aggregate,
        Line = c.Line > 1 ? c.Line : null,
        Tones = c.Tones is { Count: > 0 } ? c.Tones : null,
        ValueLabels = c.ValueLabels is { Count: > 0 } ? c.ValueLabels : null,
    };

    /// <summary>Menu entries as Java's buildMenu: path = the declared one, else the label camel-cased.</summary>
    internal static IReadOnlyList<MenuOptionDto> Menu(IReadOnlyList<MenuOption>? options) =>
        (options ?? []).Select(o => new MenuOptionDto(o.Label, o.Path ?? JavaCamelCase(o.Label))
        {
            Component = o.Component is null ? null : Map(o.Component),
            Selected = o.Selected,
            Disabled = o.Disabled,
            DisabledOnClick = o.DisabledOnClick,
            ClassName = o.ClassName,
            ItemData = o.ItemData,
            Submenus = Menu(o.Submenu),
            Separator = o.Separator,
            // a leaf says what picking it does: an action, else where it goes (Java's buildMenu)
            ActionId = IsLeaf(o) ? o.ActionId : null,
            Route = IsLeaf(o) && o.ActionId is null ? o.Path : null,
        }).ToList();

    private static bool IsLeaf(MenuOption o) => o.Submenu.Count == 0 && !o.Separator;

    private static readonly Regex Boundaries = new("(?<=[A-Z])(?=[A-Z][a-z])|(?<=[^A-Z])(?=[A-Z])|(?<=[A-Za-z])(?=[^A-Za-z])");

    /// <summary>Java's Humanizer.toCamelCase, exactly ("Sales orders" → "salesOrders").</summary>
    internal static string? JavaCamelCase(string? s)
    {
        if (string.IsNullOrEmpty(s)) return s;
        var c = Regex.Replace(Boundaries.Replace(s.Replace('.', ' '), " ").ToLowerInvariant(), " +", " ");
        if (c.Length <= 1) return c;
        var parts = c.Split(' ').ToList();
        while (parts.Count > 0 && parts[^1].Length == 0) parts.RemoveAt(parts.Count - 1); // Java's split
        var sb = new System.Text.StringBuilder();
        for (var i = 0; i < parts.Count; i++)
        {
            var z = parts[i];
            if (i > 0 && z.Trim().Length > 0) sb.Append(char.ToUpperInvariant(z[0])).Append(z[1..]);
            else sb.Append(z);
        }
        return sb.ToString();
    }

    /// <summary>The action ids this family references and the components it holds, for the view to
    /// advertise (ComponentMapper.CollectActionIds).</summary>
    internal static IEnumerable<IComponent> ChildrenOf(IComponent c, List<string> ids)
    {
        switch (c)
        {
            case MessageInput mi when !string.IsNullOrEmpty(mi.ActionId): ids.Add(mi.ActionId); break;
            case GridColumn col when !string.IsNullOrEmpty(col.ActionId): ids.Add(col.ActionId); break;
        }
        return c switch
        {
            BoardLayout b => b.Rows,
            BoardLayoutRow r => r.Content,
            BoardLayoutItem { Content: { } i } => [i],
            CarouselLayout cl => cl.Content,
            Container { Content: { } x } => [x],
            FullWidth { Content: { } x } => [x],
            Scroller { Content: { } x } => [x],
            FormItem fi => fi.Content,
            FormSubSection fs => fs.Content,
            MasterDetailLayout md => md.Detail is null ? [md.Master] : [md.Master, md.Detail],
            ContextMenu { Wrapped: { } w } => [w],
            VirtualList vl => vl.Content,
            Grid g => g.Content,
            GridGroupColumn gc => gc.Columns,
            _ => [],
        };
    }
}
