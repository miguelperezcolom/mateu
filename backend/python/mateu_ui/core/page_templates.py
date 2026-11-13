"""A :class:`~mateu_ui.uidl.components.Form` that fills a page template, laid out (the Python mirror
of Java's ``PageTemplates``, core fragmentmapper): the template's slots become ordinary components —
each in a container whose id names the slot — so every renderer draws the page, and the template's
own values travel on the Form metadata (``template``) for a renderer that has the template itself
(Redwood paints Spectra's) and places each slot where it belongs.

The browser expander (libs/mateu ``expander/pageTemplates.ts``) lays a statically bundled page out
the same way; the three are pinned by the Java goldens (``tests/test_yaml_page_templates.py``).
"""

from __future__ import annotations

from mateu_ui.dtos import PageTemplateRecord, TemplateImageRecord
from mateu_ui.uidl import components as fluent
from mateu_ui.uidl.page_templates import (
    AdvancedCreateEditPage,
    CollectionDetailPage,
    DashboardLandingPage,
    DataManagementPage,
    FoldoutPage,
    GeneralOverviewPage,
    GuidedProcessPage,
    HeroSearchPage,
    ItemOverviewPage,
    MultimediaContentPage,
    TemplateImage,
    WelcomePage,
)
from mateu_ui.uidl.patterns import DockedPanel, HeroTone

_TEMPLATES = (
    ItemOverviewPage,
    WelcomePage,
    DashboardLandingPage,
    GeneralOverviewPage,
    CollectionDetailPage,
    FoldoutPage,
    MultimediaContentPage,
    AdvancedCreateEditPage,
    GuidedProcessPage,
    DataManagementPage,
    HeroSearchPage,
)

_BORDER = "1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1))"


def content_of(form: fluent.Form) -> tuple:
    """The page's content: the template laid out, or the authored content of a free page."""
    t = form.template
    content = tuple(form.content)
    if isinstance(t, ItemOverviewPage):
        return (_item_overview(t, content, form.title),)
    if isinstance(t, WelcomePage):
        return _banner("welcome", t.background_color, form)
    if isinstance(t, MultimediaContentPage):
        return _banner("multimedia-banner", t.background_color, form)
    if isinstance(t, HeroSearchPage):
        return _banner("hero-search", t.background_color, form)
    if isinstance(t, DashboardLandingPage):
        return _dashboard(t, content)
    if isinstance(t, GeneralOverviewPage):
        return (_general_overview(t, content),)
    if isinstance(t, CollectionDetailPage):
        return (_collection_detail(t, content),)
    if isinstance(t, FoldoutPage):
        return (_foldout(t, content),)
    if isinstance(t, AdvancedCreateEditPage):
        return _advanced_create_edit(t, content)
    if isinstance(t, GuidedProcessPage):
        return (_guided_process(t),)
    if isinstance(t, DataManagementPage):
        return (_data_management(t, form),)
    return content


def owns_header(form: fluent.Form) -> bool:
    """Whether the template draws the page's header itself (its title, subtitle and actions live in
    the template's banner): the form then carries no header and no toolbar of its own."""
    return isinstance(
        form.template, (WelcomePage, MultimediaContentPage, DataManagementPage, HeroSearchPage)
    )


def record_of(template, page_title: str | None = None) -> PageTemplateRecord | None:
    """The template's own values, for the wire; None for a free page (or an unknown template)."""
    if not isinstance(template, _TEMPLATES):
        return None
    if isinstance(template, ItemOverviewPage):
        return PageTemplateRecord(
            type=type(template).__name__,
            avatar=_image_record(template.avatar, page_title),
            photo=_image_record(template.photo, page_title),
        )
    return PageTemplateRecord(type=type(template).__name__)


def page_type_of(template) -> str | None:
    """The coarse page type a template implies (Java's ``PageTypeResolver.ofTemplate``), wire name."""
    name = type(template).__name__ if template is not None else None
    return {
        "CollectionDetailPage": "collection",
        "DataManagementPage": "collection",
        "DashboardLandingPage": "dashboard",
        "WelcomePage": "landing",
        "HeroSearchPage": "landing",
        "ItemOverviewPage": "detail",
        "GeneralOverviewPage": "detail",
        "FoldoutPage": "detail",
        "MultimediaContentPage": "detail",
        "GuidedProcessPage": "process",
        "AdvancedCreateEditPage": "form",
    }.get(name or "")


def tone_of(background_color: str | None) -> HeroTone | None:
    """The banner's tone: Spectra's ``dark-<tone>`` or the bare tone; None if unknown or ``auto``
    (Java's ``WelcomePage.toneOrNull``)."""
    if background_color is None or not str(background_color).strip():
        return None
    tone = str(background_color).strip()
    if tone.startswith("dark-"):
        tone = tone[len("dark-") :]
    for t in HeroTone:
        if t.name.lower() == tone.lower():
            return None if t is HeroTone.auto else t
    return None


def _image_record(image: TemplateImage | None, page_title: str | None) -> TemplateImageRecord | None:
    return (
        None
        if image is None
        else TemplateImageRecord(
            src=image.src, initials=image.initials, alt=alt_of(image, page_title)
        )
    )


def alt_of(image: TemplateImage, page_title: str | None) -> str | None:
    """The text a screen reader reads for a template's image: the declared ``alt``, else the
    page's title (the image is the record the page is about) — Java's ``PageTemplates.altOf``."""
    if _filled(getattr(image, "alt", None)):
        return image.alt
    return page_title if _filled(page_title) else None


def _slot(id: str, content, style: str | None) -> fluent.VerticalLayout:
    return fluent.VerticalLayout(id=id, content=tuple(content), style=style)


def _region(content) -> fluent.VerticalLayout:
    return fluent.VerticalLayout(
        content=tuple(content), full_width=True, horizontal_alignment="STRETCH", spacing=True
    )


def _filled(value: str | None) -> bool:
    return value is not None and bool(str(value).strip())


def _media(t: ItemOverviewPage, page_title: str | None):
    """The avatar (a round image, else the initials) or the 4:3 photo."""
    avatar, photo = t.avatar, t.photo
    if avatar is not None and _filled(avatar.src):
        return fluent.Image(
            src=str(avatar.src),
            style="width: 8rem; height: 8rem; border-radius: 50%; object-fit: cover",
            alt=alt_of(avatar, page_title),
        )
    if avatar is not None and _filled(avatar.initials):
        return fluent.Avatar(abbreviation=avatar.initials, style="width: 8rem; height: 8rem")
    if photo is not None and _filled(photo.src):
        return fluent.Image(
            src=str(photo.src),
            style="width: 100%; aspect-ratio: 4 / 3; object-fit: cover",
            alt=alt_of(photo, page_title),
        )
    return None


def _item_overview(t: ItemOverviewPage, main: tuple, page_title: str | None = None):
    panel = []
    media = _media(t, page_title)
    if media is not None:
        panel.append(_slot("item-overview-media", [media], "width: 100%; align-items: center"))
    panel.append(_slot("item-overview-body", t.body, "width: 100%"))
    if t.footer:
        panel.append(_slot("item-overview-footer", t.footer, "width: 100%"))
    return fluent.HorizontalLayout(
        id="item-overview",
        wrap=True,
        spacing=True,
        content=(
            fluent.Card(
                id="item-overview-panel",
                variants=[],
                content=_slot("item-overview-panel-content", panel, "width: 100%"),
                style="flex: 0 0 22rem; max-width: 100%; position: sticky; top: 0;"
                " align-self: flex-start",
            ),
            _slot("item-overview-main", main, "flex: 1 1 24rem; min-width: min(24rem, 100%)"),
        ),
    )


def _banner(id: str, background_color: str | None, form: fluent.Form) -> tuple:
    """A welcome-style banner (the form's title, subtitle and overline, its toolbar as the calls to
    action) over the form's content — the Welcome archetype's centred HeroSection."""
    hero = fluent.HeroSection(
        id=id,
        title=form.title,
        subtitle=form.subtitle,
        overline=form.overline,
        tone=tone_of(background_color),
        centered=True,
        content=tuple(c for c in form.toolbar if isinstance(c, fluent.Component)),
        style="width: 100%; box-sizing: border-box; margin-bottom: 1rem",
    )
    return (hero, *form.content)


def _dashboard(t: DashboardLandingPage, main: tuple) -> tuple:
    metrics = tuple(c for c in t.kpi if isinstance(c, fluent.MetricCard))
    others = tuple(c for c in t.kpi if not isinstance(c, fluent.MetricCard))
    page: list = []
    if metrics:
        page.append(fluent.Scoreboard(id="dashboard-kpi", metrics=metrics))
    page.extend(others)
    # the wire shape Java's template emits (and Redwood reads by id)
    page.append(fluent.DashboardLayout(id="dashboard-panels", items=main))
    return tuple(page)


def _general_overview(t: GeneralOverviewPage, main: tuple):
    columns = [_slot("general-overview-main", main, "flex: 2 1 32rem; min-width: min(32rem, 100%)")]
    if t.info:
        columns.append(
            _slot("general-overview-info", t.info, "flex: 1 1 16rem; min-width: min(16rem, 100%)")
        )
    return fluent.HorizontalLayout(id="general-overview", wrap=True, spacing=True, content=tuple(columns))


def _collection_detail(t: CollectionDetailPage, detail: tuple):
    side = "flex: 1 1 24rem; min-width: min(24rem, 100%)"
    return fluent.HorizontalLayout(
        id="collection-detail",
        wrap=True,
        spacing=True,
        content=(
            _slot("collection-detail-list", t.list, "flex: 0 0 24rem; max-width: 100%"),
            _slot("collection-detail-detail", detail, side)
            if detail
            else _slot("collection-detail-no-selection", t.no_selection, side),
        ),
    )


def _foldout(t: FoldoutPage, content: tuple):
    panels: list = []
    for c in content:
        if isinstance(c, fluent.FoldoutPanel):
            panels.append(c)
        else:
            panels.append(fluent.FoldoutPanel(id=f"panel{len(panels)}", open=True, content=c))
    return fluent.FoldoutLayout(
        id="foldout",
        overview=_slot("foldout-overview", t.overview, "width: 100%"),
        panels=tuple(panels),
        orientation=t.orientation or "vertical",
    )


def _advanced_create_edit(t: AdvancedCreateEditPage, main: tuple) -> tuple:
    if not t.detail:
        return main
    return (
        fluent.ResponsiveGrid(
            id="advanced-create-edit",
            columns=(fluent.GridTrack.fill(), fluent.GridTrack.fixed("22rem")),
            content=(
                fluent.Slotted(slot="main", content=_region(main)),
                fluent.Slotted(slot="aside", content=_region(t.detail)),
            ),
            stack_below="48rem",
            grid_template_areas='"main aside"',
        ),
    )


def _guided_process(t: GuidedProcessPage):
    return fluent.TabLayout(
        id="guided-process",
        tabs=tuple(
            fluent.Tab(label=step.title or "", active=i == 0, content=_region(step.content))
            for i, step in enumerate(t.steps)
        ),
    )


def _docked(panel: DockedPanel, style: str):
    body: list = [
        fluent.HorizontalLayout(
            style="align-items: center; width: 100%;",
            spacing=False,
            content=(
                fluent.Text(
                    text=panel.title or "",
                    size="m",
                    no_margins=True,
                    style="font-weight: 600; flex: 1;",
                ),
            ),
        )
    ]
    if panel.content is not None:
        body.append(panel.content)
    return fluent.VerticalLayout(
        id=panel.id, css_classes="mateu-docked-panel", style=style, content=tuple(body)
    )


def _data_management(t: DataManagementPage, form: fluent.Form):
    page: list = []
    if _filled(form.title):
        page.append(
            fluent.Text(
                id="data-management-title",
                text=str(form.title),
                size="xl",
                no_margins=True,
                style="font-weight: 600;",
            )
        )
    page.append(
        fluent.HorizontalLayout(
            id="data-management-toolbar",
            spacing=True,
            style="align-items: center;",
            content=tuple(c for c in form.toolbar if isinstance(c, fluent.Component)),
        )
    )
    view: fluent.Component = _region(form.content)
    end = t.end
    if end is not None and end.open:
        view = fluent.ResponsiveGrid(
            id="data-management-body",
            columns=(fluent.GridTrack.fill(), fluent.GridTrack.fixed(end.size or "22rem")),
            content=(
                view,
                _docked(end, f"border-left: {_BORDER}; padding-left: var(--lumo-space-m, 1rem);"),
            ),
            stack_below="48rem",
        )
    page.append(view)
    bottom = t.bottom
    if bottom is not None and bottom.open:
        page.append(
            _docked(
                bottom,
                f"border-top: {_BORDER}; padding-top: var(--lumo-space-s, .5rem); max-height: "
                f"{bottom.size or '16rem'}; overflow: auto;",
            )
        )
    return fluent.VerticalLayout(
        id="data-management",
        full_width=True,
        spacing=True,
        horizontal_alignment="STRETCH",
        content=tuple(page),
    )
