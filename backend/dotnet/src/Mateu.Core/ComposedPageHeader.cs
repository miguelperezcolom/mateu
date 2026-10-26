using Mateu.Dtos;

namespace Mateu.Core;

/// <summary>The page around a composed (tree-supplier) view's tree: its page bars and the canonical
/// header pieces it declares, or null when it declares none — the view then renders exactly as it
/// did. Titled like the view unless the tree names itself (a hero, an entity header, a
/// <c>*title</c> Text or an h1/h2 heading); a tree opening with a hero keeps its subtitle and
/// overline there. (Mirrors Java's ComponentTreeSupplierMapper.withPageBars + SelfNamingTree.)</summary>
internal static class ComposedPageHeader
{
    private const int MaxDepth = 6;

    public static PageMetadataDto? Of(PageMetadataDto page, IReadOnlyList<ComponentDto> tree)
    {
        var hero = tree.Count > 0 && OpensWithHero(tree[0]);
        var subtitle = hero ? null : page.Subtitle;
        var overline = hero ? null : page.Overline;
        var declared = page.Toolbar.Count > 0 || page.Buttons.Count > 0
            || subtitle is not null || overline is not null || page.Timestamp is not null
            || page.PeerNav is not null || page.Switcher is not null
            || page.Badges.Count > 0 || page.Kpis.Count > 0 || page.Banners.Count > 0;
        if (!declared) return null;
        var title = tree.Any(c => Names(c, 0)) ? null : page.Title;
        return new PageMetadataDto(title, null, subtitle, page.Toolbar, page.Buttons)
        {
            Overline = overline,
            Timestamp = page.Timestamp,
            PeerNav = page.PeerNav,
            Switcher = page.Switcher,
            Badges = page.Badges,
            Kpis = page.Kpis,
            Banners = page.Banners,
            TitleIsText = title is null ? null : page.TitleIsText,
        };
    }

    private static bool OpensWithHero(ComponentDto node)
    {
        var current = node;
        for (var depth = 0; current is ClientSideComponentDto client && depth < MaxDepth; depth++)
        {
            if (client.Metadata is HeroSectionMetadataDto) return true;
            current = client.Children.Count > 0 ? client.Children[0] : null;
        }
        return false;
    }

    private static bool Names(ComponentDto node, int depth)
    {
        if (depth > MaxDepth || node is not ClientSideComponentDto client) return false;
        switch (client.Metadata)
        {
            case HeroSectionMetadataDto or EntityHeaderMetadataDto:
                return true;
            case TextMetadataDto text when (client.Id ?? "").EndsWith("title")
                || (text.Container is "h1" or "h2" && !string.IsNullOrWhiteSpace(text.Text)):
                return true;
        }
        return client.Children.Any(c => Names(c, depth + 1));
    }
}
