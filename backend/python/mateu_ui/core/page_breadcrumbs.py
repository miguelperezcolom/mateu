"""The page-level breadcrumb switch decided by the REQUEST, not by the page (Java's PageMapper +
RouteChains.insideBackLinkApp): a page whose route runs, through a routes.yaml parent chain, under an
app declared ``@app(back_link=BackLink.PARENT)`` carries no trail of its own — the app's "← Parent"
link replaces it. Also used for an embedded view's own page (Java's EmbeddedView branch)."""

from __future__ import annotations

from mateu_ui.dtos import ClientSideComponent, PageMetadata, ServerSideComponent


def breadcrumbs_off(component, deep: bool) -> None:
    """Sets ``no_breadcrumbs`` on the component's pages: the pages directly under it (``deep``
    False — an embedded view's own page), or every page of the tree — the children AND the
    components a metadata record holds (a card's, a drawer's or a dialog's content…), as Java's
    PageMapper marks every page it maps. In place."""
    if isinstance(component, ClientSideComponent):
        if isinstance(component.metadata, PageMetadata):
            component.metadata.no_breadcrumbs = True
        if deep:
            _metadata_off(component.metadata)
            for child in component.children:
                breadcrumbs_off(child, True)
    elif isinstance(component, ServerSideComponent):
        for child in component.children:
            if deep:
                breadcrumbs_off(child, True)
            elif isinstance(child, ClientSideComponent) and isinstance(child.metadata, PageMetadata):
                child.metadata.no_breadcrumbs = True


def _metadata_off(value) -> None:
    """Every page among the components a metadata record holds, at any depth of its members."""
    from pydantic import BaseModel

    if isinstance(value, (ClientSideComponent, ServerSideComponent)):
        breadcrumbs_off(value, True)
    elif isinstance(value, BaseModel):
        for name in type(value).model_fields:
            _metadata_off(getattr(value, name, None))
    elif isinstance(value, (list, tuple)):
        for item in value:
            _metadata_off(item)
    elif isinstance(value, dict):
        for item in value.values():
            _metadata_off(item)


def chain_of(routes, path: str | None) -> list:
    """The authored entry answering ``path`` preceded by its parent ancestors, outermost first. Past
    a CHILD route the path is that child's own business (a crud's record, its ``/new``): the leaf is
    then the longest prefix the table answers, but only when that entry has a parent (Java's
    RouteRegistry.chain)."""
    if routes is None or path is None:
        return []
    normalized = path.split("?", 1)[0].strip("/")
    chain = routes.chain(normalized)
    if chain:
        return chain
    segments = normalized.split("/") if normalized else []
    for n in range(len(segments) - 1, 0, -1):
        prefix = "/".join(segments[:n])
        match = routes.match(prefix)
        if match is None:
            continue
        if not match.entry.has_parent():
            return []
        return routes.chain(prefix)
    return []


def inside_back_link_app(routes, registry, route: str | None) -> bool:
    """Whether ``route`` runs through an app ANCESTOR (any link of its routes.yaml chain but the
    last) whose view model is an app offering a "← Parent" link (Java's
    RouteChains.insideBackLinkApp). Like Java, only the class's ``@app(back_link=…)`` counts — a
    code shell's (``AppSupplier``) own ``back_link`` draws the app's "← Parent" link but does not
    turn its pages' trails off."""
    chain = chain_of(routes, route)
    for entry in chain[:-1]:
        view_model = entry.view_model
        if not view_model or not str(view_model).strip():
            continue
        try:
            cls = registry.authored_type(view_model)
            if cls is not None and getattr(cls, "__mateu_app_back_link__", None) == "PARENT":
                return True
        except Exception:  # noqa: BLE001 - not a class we can read: no say
            continue
    return False


def with_back_link_breadcrumbs(increment, routes, registry, route: str | None):
    """The increment with ``no_breadcrumbs`` on every page it carries when the request route runs
    under a back-link app (else unchanged)."""
    fragments = getattr(increment, "fragments", None) or []
    if not fragments or not inside_back_link_app(routes, registry, route):
        return increment
    for fragment in fragments:
        if fragment.component is not None:
            breadcrumbs_off(fragment.component, True)
    return increment
