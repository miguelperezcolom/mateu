"""The page around a composed (tree-supplier) view's tree (mirrors Java's
``ComponentTreeSupplierMapper.withPageBars`` + ``SelfNamingTree`` and .NET's ``ComposedPageHeader``).

A view that builds its own tree (a ``Dashboard``, a ``DataManagement``…) gets its page bars and the
canonical header pieces it declares — subtitle, overline, timestamp, KPIs, badges, banners, peer
navigation, a record switcher — inside a page titled like the view unless the tree names itself; a
view declaring none renders exactly as before. A tree opening with a hero keeps its subtitle and
overline there.
"""

from __future__ import annotations

from mateu_ui.dtos import (
    ClientSideComponent,
    EntityHeaderMetadata,
    HeroSectionMetadata,
    PageMetadata,
    TextMetadata,
)

_MAX_DEPTH = 6


def _opens_with_hero(node) -> bool:
    current = node
    for _ in range(_MAX_DEPTH):
        if not isinstance(current, ClientSideComponent):
            return False
        if isinstance(current.metadata, HeroSectionMetadata):
            return True
        current = current.children[0] if current.children else None
    return False


def _names(node, depth: int = 0) -> bool:
    if depth > _MAX_DEPTH or not isinstance(node, ClientSideComponent):
        return False
    meta = node.metadata
    if isinstance(meta, (HeroSectionMetadata, EntityHeaderMetadata)):
        return True
    if isinstance(meta, TextMetadata) and (
        (node.id or "").endswith("title")
        or (meta.container in ("h1", "h2") and (meta.text or "").strip())
    ):
        return True
    return any(_names(c, depth + 1) for c in node.children)


def composed_page_header(page: PageMetadata, tree: list) -> PageMetadata | None:
    """The page metadata wrapping ``tree``, or None when the view declares nothing for it."""
    hero = bool(tree) and _opens_with_hero(tree[0])
    subtitle = None if hero else page.subtitle
    overline = None if hero else page.overline
    declared = (
        page.toolbar
        or page.buttons
        or subtitle is not None
        or overline is not None
        or page.timestamp is not None
        or page.peer_nav is not None
        or page.switcher is not None
        or page.badges
        or page.kpis
        or page.banners
    )
    if not declared:
        return None
    title = None if any(_names(c) for c in tree) else page.title
    return PageMetadata(
        title=title,
        subtitle=subtitle,
        overline=overline,
        toolbar=page.toolbar,
        buttons=page.buttons,
        timestamp=page.timestamp,
        peer_nav=page.peer_nav,
        switcher=page.switcher,
        badges=page.badges,
        kpis=page.kpis,
        banners=page.banners,
        title_is_text=page.title_is_text if title is not None else None,
    )
