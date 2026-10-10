"""A plain reflected view -> its ServerSideComponent (Java's ReflectionPageMapper / ReflectionUiIncrementMapper)."""

from __future__ import annotations

from mateu_dtos import (
    Action,
    ClientSideComponent,
    PageMetadata,
    ServerSideComponent,
    Trigger,
)
from mateu_uidl import (
    components as fluent,
    ComponentTreeSupplier,
    OnRowSelected,
    RecordSwitcherSupplier,
)
from mateu_uidl.patterns import hero_tone_wire

from ..action_guard import resolve_action
from ..islands import is_inline_request
from ..layout_delta import active_for as active_layout_delta
from ..layout_delta import apply as apply_layout_delta
from ..validation import client_validations
from ..naming import (
    camel_case,
    humanize,
)
from ..page_type_inference import page_type_of
from ..reflection import (
    class_flag,
    methods_with,
    view_fields,
)
from ..registry import type_name
from ._base import MixinBase
from .layout import section_affordance_ids
from ._common import (
    _id,
    COMPACT_STYLE,
    crud_element_type,
    for_current_audience,
    listing_types,
    with_action_options,
)


class ViewMapperMixin(MixinBase):
    # ── Plain view ─────────────────────────────────────────────────────────────
    def map_view(self, cls, instance, route: str, layout_override=None) -> ServerSideComponent:
        element = crud_element_type(cls)
        if element is not None:
            return self.map_crud(cls, element, route, instance)
        if listing_types(cls) is not None:
            return self.map_listing(cls, route)

        title = self.T(getattr(cls, "__mateu_title__", humanize(cls.__name__)))
        button_methods = [
            (n, f)
            for n, f in methods_with(cls, "__mateu_button__")
            if for_current_audience(getattr(f, "__mateu_audience__", None))
            and self.authorized(getattr(f, "__mateu_eyes_only__", None))
        ]
        buttons = [self.map_button(n, f) for n, f in button_methods]
        fabs = self.fabs(cls)
        # A @rest_action button carries the client-side REST descriptor on its action.
        # FAB actions are NOT advertised in the component's actions list (Java parity — the FAB
        # carries its own actionId and the renderer dispatches it directly).
        actions = [
            with_action_options(
                Action(id=b.action_id, rest_action=self._rest_action(f)), cls, b.action_id
            )
            for (n, f), b in zip(button_methods, buttons)
        ]
        # Field-declared actions, in Java's FieldActionCollector order: list fields' row-editing
        # actions, OnRowSelected() row clicks (the renderer drops a click whose action is not
        # advertised), Lookup() searches, Searchable() code lookups — then the @button methods.
        field_actions = self.field_actions(cls)
        actions = field_actions + [a for a in actions if all(a.id != b.id for b in field_actions)]
        # @Section(add_action / edit_action / view_more_action): the section affordance buttons
        # dispatch the named methods — advertised so the client sends them (Java's
        # SectionAffordances buttons are claimed by the page's component).
        for aid in section_affordance_ids(cls):
            if all(a.id != aid for a in actions):
                actions.append(with_action_options(Action(id=aid), cls, aid))
        # The header's record switcher dispatches _switchRecord when the user picks an entry
        # (Java's ActionMapper advertises RecordSwitcherSupplier.ACTION_ID).
        if isinstance(instance, RecordSwitcherSupplier):
            actions.append(
                Action(id=RecordSwitcherSupplier.ACTION_ID, validation_required=False)
            )

        # @rest_data: fetch the screen's initial data client-side on load — a synthetic
        # __restdata__ action carrying the REST descriptor (fired by the OnLoad trigger added
        # below), reusing the @rest_action fetch+merge path.
        rest_data_desc = self._rest_data(cls)
        if rest_data_desc is not None:
            actions.append(
                Action(id="__restdata__", validation_required=False, rest_action=rest_data_desc)
            )

        # A YAML page's layout (bound to this instance as its ModelView) renders as the page
        # content exactly like an archetype's fluent tree — its FormField ids bind to the
        # instance's state (seeded into initialData below), its Button actionIds (collected below)
        # route back to the instance's methods.
        # A ComponentTreeSupplier view (and the archetypes built on it) renders its tree DIRECTLY
        # as the fragment component — no Page wrapper, no page metadata, no SetWindowTitle command
        # (Java parity). A YAML layout_override, by contrast, is a reflected page and keeps the
        # Page wrapper.
        is_tree_supplier = isinstance(instance, ComponentTreeSupplier)
        tree = layout_override if layout_override is not None else self.component_tree(instance)
        if tree is not None:
            children = [self.map_component(tree)]
            # An explicit @size on the view sizes its whole surface (coherence-plan #8): a
            # full-canvas screen that fills the viewport and scrolls internally. Overrides inference.
            sizing = getattr(cls, "__mateu_size__", None)
            if is_tree_supplier and sizing and isinstance(children[0], ClientSideComponent):
                children[0] = children[0].model_copy(update={"sizing": sizing})
            # The tree's action ids are advertised so the web client sends them (it only sends
            # what the component advertises; anything else bubbles out unclaimed and is lost).
            # A YAML layout_override page advertises every id its buttons reference (they route
            # back to the ModelView's methods). A ComponentTreeSupplier advertises the ones it has
            # a handler method for — an id it cannot handle may be meant for an ancestor component
            # and must not be captured here (same rule in Java's TreeActionHarvester and .NET).
            known = {a.id for a in actions}
            tree_ids = self.collect_action_ids(tree)
            for a in tree_ids:
                # handled = the method the action guard would let this id run
                handled = resolve_action(cls, a, lambda: set(tree_ids)) is not None
                # OWNER FIRST, then the action catalogue: an id the view neither declares nor has a
                # method for runs the catalogue entry of that id (Java's TreeActionHarvester).
                from_catalogue = (
                    not handled and self.action_catalog is not None and self.action_catalog.get(a) is not None
                )
                if a not in known and not from_catalogue and (not is_tree_supplier or handled):
                    known.add(a)
                    actions.append(Action(id=a))
            if self.action_catalog is not None:
                from ..action_registry import to_dto

                for entry in self.action_catalog.referenced_by(tree_ids, known):
                    known.add(entry.id)
                    actions.append(to_dto(entry))
        else:
            # Compact mode tightens the form: the FormLayout's minimum column width drops to 7em.
            compact_cw = "7em" if class_flag(cls, "__mateu_compact__", False) else None
            children = self.wrap_aside(
                cls, instance, self.form_cards(cls, instance, column_width=compact_cw)
            )

        # @welcome_banner: the Redwood "Welcome Banner" element is a plain HeroSection
        # prepended to the page content (mirrors Java's ReflectionPageMapper).
        welcome_banner = getattr(cls, "__mateu_welcome_banner__", None)
        if welcome_banner is not None:
            banner_title, banner_subtitle, banner_image = welcome_banner
            children = [
                self.map_component(
                    fluent.HeroSection(
                        id="welcome-banner",
                        title=self.T(banner_title) if banner_title else title,
                        subtitle=self._opt_t(banner_subtitle or None),
                        image=banner_image or None,
                        centered=True,
                        tone=hero_tone_wire(getattr(cls, "__mateu_welcome_banner_tone__", None)),
                    )
                )
            ] + children

        compact = bool(class_flag(cls, "__mateu_compact__", False))
        page_type = page_type_of(cls)
        # An Inline() embedded island blends into its host: a sub-heading title (level 1) and no
        # header badges/KPIs (Java's EditableView.isInline → PageView.level=1).
        inline = is_inline_request()
        page_meta = PageMetadata(
            level=1 if inline else 0,
            title=title,
            # pageTitle is the humanized class name (the derived page identity); title is the
            # declared @title. They coincide when the class name humanizes to the @title (Java parity).
            page_title=humanize(cls.__name__),
            subtitle=self._opt_t(class_flag(cls, "__mateu_subtitle__", None)),
            toolbar=[],
            buttons=buttons,
            toc=getattr(cls, "__mateu_toc__", None),
            banners=self.banners(cls, instance),
            badges=[] if inline else self.badges(cls, instance),
            kpis=[] if inline else self.kpis(cls, instance),
            fabs=fabs,
            page_type=page_type,
            peer_nav=self.peer_nav(instance),
            switcher=self.record_switcher(instance),
            timestamp=self.timestamp_of(cls, instance),
            overline=self._opt_t(class_flag(cls, "__mateu_overline__", None)),
            title_placeholder=self._opt_t(
                class_flag(cls, "__mateu_title_placeholder__", None)
            ),
        )
        if is_tree_supplier:
            # The tree is the fragment component: the ServerSide holds the mapped tree children
            # directly and carries the supplier's own container style (Java's
            # ComponentTreeSupplier.style(), default "max-width:900px;margin: auto;").
            server_children = children
            server_style = instance.style()
        else:
            page = ClientSideComponent(
                metadata=page_meta,
                children=children,
                style=COMPACT_STYLE if compact else None,
            )
            server_children = [page]
            server_style = None
        triggers, emits = self.events_of(cls)
        # @rest_data: fire the synthetic __restdata__ action on load (the action is advertised above).
        if rest_data_desc is not None:
            triggers = list(triggers) + [Trigger(type="OnLoad", action_id="__restdata__")]
        initial_data: dict = {}
        if tree is not None:
            # Tree-supplier views (archetypes): scalar attributes are the view's state — seed
            # them into initialData so they round-trip through componentState (search text,
            # selection, switcher value…).
            declared = {
                name
                for c in type(instance).__mro__
                for name in getattr(c, "__annotations__", {})
                if not name.startswith("_")
            }
            for name in declared:
                value = getattr(instance, name, None)
                if value is None or isinstance(value, (str, int, float, bool)):
                    initial_data[camel_case(name)] = value
            refresh = getattr(cls, "__mateu_refresh_action__", None)
            if refresh:
                # any field change re-renders the view in place (debounced) — the AutoSave
                # trigger the shared frontend already honors
                triggers = list(triggers) + [
                    {
                        "type": "AutoSave",
                        "actionId": refresh,
                        "debounceMillis": getattr(cls, "__mateu_refresh_debounce__", 400),
                    }
                ]
        else:
            initial_data = self.form_initial_data(cls, instance)
        # Proxy mode (RestOptions/rest_listing/rest_action/rest_data with proxy=True): advertise the
        # reserved __restfetch__ action so the renderer can route the fetch through the server (which
        # resolves the DECLARED source, injects ${secret.X} and fetches server-side).
        if self._has_proxy_source(cls, instance):
            actions = list(actions) + [Action(id="__restfetch__")]
        # A layoutDelta: page: the human's decisions re-applied over the freshly inferred layout.
        server_children = apply_layout_delta(server_children, active_layout_delta(cls))
        return ServerSideComponent(
            id=_id(),
            server_side_type=type_name(cls),
            route=route,
            children=server_children,
            style=server_style,
            initial_data=initial_data,
            actions=actions,
            triggers=triggers,
            emits_name=emits,
            confirm_on_navigation_if_dirty=bool(class_flag(cls, "__mateu_confirm_dirty__", False)),
            rules=self.map_rules(cls, instance),
            page_width=getattr(cls, "__mateu_page_width__", None),
            page_type=page_type,
            static_view=bool(class_flag(cls, "__mateu_static_view__", False)),
            # declared constraints → client-side validations; a tree supplier composes its own
            # tree, it is not a form (Java's ValidationMapper: page/form/record only)
            validations=(
                [] if is_tree_supplier else client_validations(self, cls, instance)
            ),
        )
