"""Test a Mateu UI with no browser and no server (EXPERIMENTAL, 3.0: the API may still change).

``MateuTest`` wires Mateu exactly as ``add_mateu`` does in the app, then opens routes the way a
renderer would and lets the test read what renders (``Screen``), type into fields and press
buttons. What a test reads is the ``/mateu/v3/sync`` answer every renderer receives, so a passing
test means the screen really looks and behaves that way::

    from mateu_ui.testing import MateuTest

    def test_products():
        mateu = MateuTest(app_module)
        products = mateu.open("/products")
        assert products.listing().total == 4
        form = products.button("New").press()
        form.field("name").set("Kettle")
        form.button("Save").press()

Client-side rules, REST sources called from the browser and scripts are not run: they are
reported as declared, never evaluated. A ``Screen`` is one user's tab — not thread-safe.
"""

from __future__ import annotations

import copy
from collections.abc import Callable
from enum import Enum
from types import ModuleType
from typing import Any

from fastapi import FastAPI

from mateu_ui.core import RunActionRq, SyncHandler
from mateu_ui.core.errors import error_increment
from mateu_ui.core.request_context import MateuRequest, bound_request
from mateu_ui.uidl import Identity

__all__ = ["Button", "Command", "Field", "Listing", "MateuTest", "MateuTestError", "Message", "Row", "Screen"]

_MAX_DEPTH = 40


class MateuTestError(AssertionError):
    """A failed expectation against a ``Screen`` (no such field, a disabled button pressed…). The
    message says what there is instead."""


class Message:
    """A message (toast) the UI showed."""

    def __init__(self, wire: dict):
        self.wire = wire
        self.variant = str(wire.get("variant") or "")
        self.title = str(wire.get("title") or "")
        self.text = str(wire.get("text") or "")

    @property
    def is_error(self) -> bool:
        return self.variant.lower() == "error"

    def __repr__(self) -> str:
        return f"Message({self.variant!r}, {self.title!r}, {self.text!r})"


class Command:
    """A command the server sent (``NavigateTo``, ``SetWindowTitle``, ``CloseModal``…), applied."""

    def __init__(self, type_: str, data: Any):
        self.type = type_
        self.data = data

    def __repr__(self) -> str:
        return f"Command({self.type!r}, {self.data!r})"


class MateuTest:
    """A Mateu backend in the test's process.

    ``sources`` and ``options`` are what ``add_mateu`` takes (the modules or classes holding the
    ``@app``/``@ui`` views, ``translator=``, ``mock_sources``…); the identity of each screen is
    the one ``open(..., identity=...)`` names, read through the app's ``identity_provider`` as the
    request's authenticated principal."""

    def __init__(self, *sources: ModuleType | type, **options: Any):
        self.handler: SyncHandler = _add_mateu(FastAPI(), *sources, **options)

    def open(self, route: str, identity: Identity | None = None) -> Screen:
        """Opens ``route`` as ``identity`` (None = anonymous), as a browser landing on it."""
        screen = Screen(self, identity)
        screen.navigate(route)
        return screen

    def exchange(self, request: dict, identity: Identity | None = None) -> dict:
        """The raw exchange: one request (the JSON a renderer posts) → the answer, as wire JSON."""
        rq = RunActionRq.model_validate(request)
        with bound_request(MateuRequest(principal=identity, correlation_id="test")):
            try:
                increment = self.handler.handle(rq)
            except Exception as error:  # noqa: BLE001 - only what the boundary shows as written
                if not _for_the_user(error):
                    raise
                increment = error_increment(error, "test", False, rq.action_id)
        return increment.model_dump(by_alias=True, mode="json")

    @staticmethod
    def user(*roles: str, name: str = "test-user") -> Identity:
        """A signed-in user with these roles, for the access rules."""
        return Identity(roles=tuple(roles), name=name)


def _add_mateu(app: FastAPI, *sources, **options) -> SyncHandler:
    from mateu_ui.fastapi import add_mateu

    return add_mateu(app, *sources, **options)


def _for_the_user(error: BaseException) -> bool:
    """Whether the error boundary shows ``error`` as written (a UserFacingException, a validation
    error) — what a test expects to read as a message; anything else is a bug the test must see."""
    from pydantic import ValidationError

    from mateu_ui.uidl import UserFacingException

    seen = set()
    e: BaseException | None = error
    while e is not None and id(e) not in seen:
        seen.add(id(e))
        if isinstance(e, (UserFacingException, ValidationError)):
            return True
        e = e.__cause__ or e.__context__
    return False


def _s(value: Any) -> str:
    return "" if value is None else str(value)


def _collect(root: Any, accept: Callable[[dict], bool]) -> list[dict]:
    out: list[dict] = []
    seen: set[int] = set()

    def walk(node: Any) -> None:
        if node is None or id(node) in seen:
            return
        if isinstance(node, dict):
            seen.add(id(node))
            if accept(node):
                out.append(node)
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            seen.add(id(node))
            for v in node:
                walk(v)

    walk(root)
    return out


def _contains_text(node: Any, text: str) -> bool:
    if isinstance(node, str):
        return text in node
    if isinstance(node, dict):
        return any(
            _contains_text(v, text)
            for k, v in node.items()
            if k not in ("id", "type", "serverSideType") and not k.endswith("Id")
        )
    if isinstance(node, list):
        return any(_contains_text(v, text) for v in node)
    return node is not None and not isinstance(node, bool) and str(node) == text


def _json(value: Any) -> Any:
    if isinstance(value, Enum):
        return value.name
    return value


class _Frame:
    """One place a component is drawn: the page, or a dialog/drawer over it."""

    def __init__(self) -> None:
        self.route = ""
        self.consumed_route = ""
        self.server_side_type = ""
        self.component_id = ""
        self.orchestrator_type = ""
        self.orchestrator_route = ""
        self.overlay_title = ""
        self.opener: _Frame | None = None
        self.hops = 0
        self.component: dict = {}
        self.server_side: dict = {}
        self.state: dict = {}
        self.data: dict = {}
        self.seed: dict = {}
        self.actions: list[dict] = []

    def adopt(self, server_side: dict) -> None:
        self.server_side = server_side
        if not self.component or self.opener is None:
            self.component = server_side
        if _s(server_side.get("id")):
            self.component_id = _s(server_side.get("id"))
        sst = _s(server_side.get("serverSideType"))
        if sst:
            self.server_side_type = sst
        if _s(server_side.get("route")) and self.opener is None and not self.route:
            self.route = _s(server_side.get("route"))
        self.actions = [a for a in server_side.get("actions") or [] if isinstance(a, dict)]
        initial = server_side.get("initialData")
        if isinstance(initial, dict):
            self.state.update(copy.deepcopy(initial))
            if "_componentRoute" in initial and sst and not self.orchestrator_type:
                self.orchestrator_type = sst
                self.orchestrator_route = _s(initial.get("_componentRoute"))

    def action(self, action_id: str) -> dict | None:
        return next((a for a in self.actions if a.get("id") == action_id), None)

    def owns(self, action_id: str) -> bool:
        for a in self.actions:
            i = _s(a.get("id"))
            if i == action_id or (i.endswith("*") and action_id.startswith(i[:-1])):
                return True
        return False

    def target_for(self, action_id: str) -> _Frame:
        bubbles = not self.owns(action_id) or bool((self.action(action_id) or {}).get("bubble"))
        if bubbles and self.opener is not None:
            t = _Frame()
            t.route, t.consumed_route, t.server_side_type = (
                self.opener.route, self.opener.consumed_route, self.opener.server_side_type)
            return t
        if (bubbles and self.orchestrator_type and self.orchestrator_type != self.server_side_type
                and self.route.startswith(self.orchestrator_route)):
            t = _Frame()
            t.route, t.consumed_route, t.server_side_type = self.route, self.consumed_route, self.orchestrator_type
            return t
        return self

    def seed_search(self) -> None:
        self.state.setdefault("page", 0)
        self.state.setdefault("size", 10)
        self.state.setdefault("sort", [])
        self.state.setdefault("searchText", "")


class Screen:
    """One browser tab on a Mateu UI, with no browser: what is on screen and the gestures a user
    makes on it. Every gesture sends the request a renderer would send and applies the answer as
    the renderers do — following an app shell to its home, a crud to its listing, a navigation to
    its target, running the listing's first search and stacking dialogs and drawers."""

    def __init__(self, mateu: MateuTest, identity: Identity | None):
        self._mateu = mateu
        self._identity = identity
        self._frames: list[_Frame] = [_Frame()]
        self._messages: list[Message] = []
        self._commands: list[Command] = []
        self._app_state: dict = {}
        self._app: dict = {}
        self._title = ""
        self._depth = 0
        self._later: list[list[Callable[[], None]]] = []
        self.route = ""

    # ── what is on screen ──────────────────────────────────────────────────────────────

    @property
    def title(self) -> str:
        """The window title (``SetWindowTitle``), else the page header's title."""
        return self._title or self.page_title

    @property
    def page_title(self) -> str:
        for node in _collect(self._top.component, lambda n: "title" in n):
            if n_type(node) in ("Page", "Form", "Crud", "App") and _s(node.get("title")):
                return _s(node.get("title"))
        return ""

    @property
    def menu(self) -> list[str]:
        """The app shell's menu labels ("Group > Entry" inside a group)."""
        out: list[str] = []

        def walk(options, prefix):
            for o in options or []:
                label = prefix + _s(o.get("label"))
                children = (o.get("submenus") or []) + (o.get("children") or [])
                if children:
                    walk(children, label + " > ")
                else:
                    out.append(label)

        walk(self._app.get("menu"), "")
        return out

    @property
    def fields(self) -> list[Field]:
        """The fields on screen (the top dialog/drawer when one is open); not a listing's filters."""
        frame = self._top
        filters = {id(f) for crud in self._cruds(frame) for f in (crud.get("metadata") or {}).get("filters") or []}
        return [Field(self, frame, n) for n in _collect(frame.component, lambda n: n.get("type") == "FormField")
                if _s(n.get("fieldId")) and id(n) not in filters]

    def field(self, id_or_label: str) -> Field:
        """A field by id or label; fails listing the fields there are."""
        found = self._find_field(id_or_label)
        if found is None:
            raise MateuTestError(f'No field "{id_or_label}" on {self._where}. Fields: {[f.id for f in self.fields]}')
        return found

    def has_field(self, id_or_label: str) -> bool:
        return self._find_field(id_or_label) is not None

    def _find_field(self, id_or_label: str) -> Field | None:
        all_ = self.fields
        return next((f for f in all_ if f.id == id_or_label), None) or next(
            (f for f in all_ if f.label.lower() == id_or_label.lower()), None)

    @property
    def buttons(self) -> list[Button]:
        """The buttons on screen (toolbar, form buttons, listing toolbar), in order."""
        frame = self._top
        nodes = _collect(frame.component, lambda n: n.get("type") == "Button")
        for n in _collect(frame.component, lambda n: "actionId" in n and "label" in n
                          and "type" not in n and "fieldId" not in n):
            if all(n is not m for m in nodes):
                nodes.append(n)
        return [Button(self, frame, n) for n in nodes]

    def button(self, label_or_action: str) -> Button:
        """A button by label, id or action id; fails listing the buttons there are."""
        found = self._find_button(label_or_action)
        if found is None:
            raise MateuTestError(f'No button "{label_or_action}" on {self._where}. Buttons: {self.buttons}')
        return found

    def has_button(self, label_or_action: str) -> bool:
        return self._find_button(label_or_action) is not None

    def _find_button(self, key: str) -> Button | None:
        all_ = self.buttons
        return (next((b for b in all_ if b.label == key), None)
                or next((b for b in all_ if b.label.lower() == key.lower()), None)
                or next((b for b in all_ if b.action_id.lower() == key.lower()), None))

    def listing(self) -> Listing:
        """The listing on screen; fails when there is none."""
        cruds = self._cruds(self._top)
        if not cruds:
            raise MateuTestError("No listing on " + self._where)
        return Listing(self, self._top, cruds[0])

    @property
    def has_listing(self) -> bool:
        return bool(self._cruds(self._top))

    @staticmethod
    def _cruds(frame: _Frame) -> list[dict]:
        return _collect(frame.component, lambda n: isinstance(n.get("metadata"), dict)
                        and n["metadata"].get("type") == "Crud")

    def shows(self, text: str) -> bool:
        """Whether this text is on screen: a title, label, text, value, cell or message."""
        frame = self._top
        return (text in self.title or any(text in m.text or text in m.title for m in self._messages)
                or any(_contains_text(s, text) for s in (frame.component, frame.state, frame.data)))

    @property
    def messages(self) -> list[Message]:
        """The messages (toasts) the last gesture produced."""
        return list(self._messages)

    @property
    def last_message(self) -> Message:
        if not self._messages:
            raise MateuTestError("The last gesture showed no message, on " + self._where)
        return self._messages[-1]

    @property
    def commands(self) -> list[Command]:
        """The commands the server sent for the last gesture, already applied."""
        return list(self._commands)

    @property
    def has_overlay(self) -> bool:
        return len(self._frames) > 1

    @property
    def overlay_title(self) -> str:
        return self._top.overlay_title if self.has_overlay else ""

    def close_overlay(self) -> Screen:
        """Closes the top dialog or drawer the way its ✕ does (nothing is sent)."""
        if not self.has_overlay:
            raise MateuTestError("No dialog or drawer is open on " + self._where)
        self._frames.pop()
        return self

    @property
    def state(self) -> dict:
        """The state the screen sends with its next action (a copy)."""
        return copy.deepcopy(self._top.state)

    @property
    def component(self) -> dict:
        """The component tree on screen, as the wire JSON."""
        return self._top.component

    # ── gestures ──────────────────────────────────────────────────────────────────────

    def navigate(self, route: str) -> Screen:
        """Goes to a route, like typing it in the address bar (overlays close)."""
        self._start_gesture()
        self._go_to(route)
        return self

    def run(self, action_id: str, parameters: dict | None = None) -> Screen:
        """Runs an action of the screen by id, as a button or a trigger would."""
        self._start_gesture()
        self._dispatch(self._top, action_id, {k: _json(v) for k, v in (parameters or {}).items()})
        return self

    # ── the client ────────────────────────────────────────────────────────────────────

    @property
    def _top(self) -> _Frame:
        return self._frames[-1]

    @property
    def _where(self) -> str:
        return self.route or "the root"

    def _start_gesture(self) -> None:
        self._messages.clear()
        self._commands.clear()

    def _go_to(self, route: str) -> None:
        del self._frames[1:]
        page = _Frame()
        self._frames[0] = page
        self.route = route
        # a fresh load, as a browser landing on the URL sends it
        self._load(page, route, "_empty", "")

    def _dispatch(self, frame: _Frame, action_id: str, parameters: dict) -> None:
        if self._later:
            self._later[-1].append(lambda: self._dispatch_now(frame, action_id, parameters))
        else:
            self._dispatch_now(frame, action_id, parameters)

    def _dispatch_now(self, frame: _Frame, action_id: str, parameters: dict) -> None:
        action = frame.action(action_id)
        if action and isinstance(action.get("restAction"), dict):
            raise NotImplementedError(f'"{action_id}" calls a REST endpoint from the browser: the harness does not call it')
        target = frame.target_for(action_id)
        self._send(frame, self._request(target.route, target.consumed_route, target.server_side_type,
                                        frame.component_id, copy.deepcopy(frame.state), parameters, action_id))

    def _load(self, frame: _Frame, route: str, consumed: str, sst: str) -> None:
        if self._later:
            self._later[-1].append(lambda: self._load_now(frame, route, consumed, sst))
        else:
            self._load_now(frame, route, consumed, sst)

    def _load_now(self, frame: _Frame, route: str, consumed: str, sst: str) -> None:
        frame.route, frame.consumed_route, frame.server_side_type = route, consumed, sst
        self._send(frame, self._request(route, consumed, sst, frame.component_id, copy.deepcopy(frame.seed), {}, ""))

    def _request(self, route, consumed, sst, component_id, state, parameters, action_id) -> dict:
        return {
            "route": route,
            "consumedRoute": consumed,
            "serverSideType": sst or None,
            "initiatorComponentId": component_id or "ux",
            "componentState": state,
            "appState": copy.deepcopy(self._app_state),
            "parameters": parameters,
            "actionId": action_id,
        }

    def _send(self, frame: _Frame, rq: dict) -> None:
        self._depth += 1
        if self._depth > _MAX_DEPTH:
            self._depth = 0
            raise MateuTestError(f"The UI keeps loading (more than {_MAX_DEPTH} chained requests) on {self._where}")
        try:
            answer = self._mateu.exchange(rq, self._identity)
            follow_ups: list[Callable[[], None]] = []
            self._later.append(follow_ups)
            try:
                self._apply(frame, answer)
            finally:
                self._later.pop()
            for follow_up in follow_ups:
                follow_up()
        finally:
            self._depth -= 1

    def _apply(self, frame: _Frame, answer: dict) -> None:
        for fragment in answer.get("fragments") or []:
            if isinstance(fragment, dict):
                self._apply_fragment(frame, fragment)
        for m in answer.get("messages") or []:
            self._messages.append(Message(m))
        if isinstance(answer.get("appState"), dict):
            self._app_state.update(answer["appState"])
        for c in answer.get("commands") or []:
            command = Command(_s(c.get("type")), c.get("data"))
            self._commands.append(command)
            self._apply_command(frame, command)

    def _apply_command(self, frame: _Frame, command: Command) -> None:
        if command.type == "SetWindowTitle":
            self._title = _s(command.data)
        elif command.type == "NavigateTo":
            target = _s(command.data.get("route")) if isinstance(command.data, dict) else _s(command.data)
            if target:
                self._go_to(target)
        elif command.type == "PushStateToHistory":
            if _s(command.data):
                self.route = _s(command.data)
        elif command.type == "CloseModal":
            if len(self._frames) > 1:
                self._frames.remove(frame if frame in self._frames and frame is not self._frames[0] else self._frames[-1])
        elif command.type == "RunAction":
            data = command.data if isinstance(command.data, dict) else {}
            action_id = _s(data.get("actionId")) if data else _s(command.data)
            if action_id:
                self._dispatch(frame if frame in self._frames else self._top, action_id,
                               dict(data.get("parameters") or {}))

    def _replace(self, old: _Frame, new: _Frame) -> None:
        for i, f in enumerate(self._frames):
            if f is old:
                self._frames[i] = new

    def _apply_fragment(self, frame: _Frame, fragment: dict) -> None:
        component = fragment.get("component")
        raw_state = fragment.get("state")
        state: dict = raw_state if isinstance(raw_state, dict) else {}
        data = fragment.get("data")
        if not isinstance(component, dict) or not component:
            if isinstance(data, dict) and data:
                frame.data.update(data)
                return
            if "_route" in state and "_componentRoute" in state:
                # a crud moving between its own routes (list, /new, /{id}, /{id}/edit)
                base = _s(state["_componentRoute"]) or frame.consumed_route
                inner = _s(state["_route"])
                full = base if inner == "list" else base + inner
                sst = frame.orchestrator_type or frame.server_side_type
                self.route = full
                nxt = _Frame()
                nxt.orchestrator_type, nxt.orchestrator_route = sst, base
                nxt.seed.update(frame.seed)
                self._replace(frame, nxt)
                self._load(nxt, full, base, sst)
                return
            frame.state.update(state)
            return
        raw_metadata = component.get("metadata")
        metadata: dict = raw_metadata if isinstance(raw_metadata, dict) else {}
        kind = _s(metadata.get("type"))
        if fragment.get("action") == "Add" and kind in ("Dialog", "Drawer"):
            overlay = _Frame()
            overlay.opener = frame
            overlay.route, overlay.consumed_route = frame.route, frame.consumed_route
            overlay.server_side_type, overlay.component_id = frame.server_side_type, frame.component_id
            overlay.actions = list(frame.actions)
            overlay.overlay_title = _s(metadata.get("headerTitle"))
            overlay.component = component
            if isinstance(metadata.get("initialData"), dict):
                overlay.state.update(metadata["initialData"])
            overlay.state.update(state)
            self._frames.append(overlay)
            islands = _collect(component, lambda n: n.get("type") == "ServerSide" and n is not component)
            if islands:
                overlay.adopt(islands[0])
            return
        self._render(frame, component, state, data)

    def _render(self, frame: _Frame, component: dict, state: dict, data: Any) -> None:
        raw_metadata = component.get("metadata")
        metadata: dict = raw_metadata if isinstance(raw_metadata, dict) else {}
        server_side = component.get("type") == "ServerSide"
        if not server_side and metadata.get("type") == "App":
            self._follow_home(frame, metadata, {})
            return
        if not server_side:
            frame.component = component
            frame.state.update(state)
            return
        children = component.get("children") or []
        if not children:
            # a component announced, loaded on its own
            nxt = _Frame()
            nxt.component_id = _s(component.get("id"))
            nxt.seed.update(frame.seed)
            self._replace(frame, nxt)
            self._load(nxt, _s(component.get("route")), frame.consumed_route, _s(component.get("serverSideType")))
            return
        first: dict = children[0] if isinstance(children[0], dict) else {}
        raw_first = first.get("metadata")
        first_metadata: dict = raw_first if isinstance(raw_first, dict) else {}
        if first.get("type") == "ClientSide" and first_metadata.get("type") == "App":
            # a crud's (or an island's) chrome-less shell: what it shows is its home
            seed = dict(component.get("initialData") or {})
            seed.update(state)
            self._follow_home(frame, first_metadata, seed)
            return
        frame.adopt(component)
        frame.state.update(state)
        if isinstance(data, dict):
            frame.data.update(data)
        for t in component.get("triggers") or []:
            if _s(t.get("type")).lower() != "onload":
                continue
            if isinstance(t.get("timeoutMillis"), (int, float)) and t["timeoutMillis"] > 0:
                continue
            action_id = _s(t.get("actionId"))
            if not action_id:
                continue
            if action_id == "search":
                frame.seed_search()
            self._dispatch(frame, action_id, {})

    def _follow_home(self, frame: _Frame, app: dict, seed: dict) -> None:
        if app.get("variant") != "MEDIATOR" or not self._app:
            self._app = app
        route = _s(app.get("homeRoute"))
        consumed = _s(app.get("homeConsumedRoute"))
        sst = _s(app.get("homeServerSideType")) or _s(app.get("serverSideType"))
        if not route and not sst:
            return
        frame.hops += 1
        if frame.hops > 8:
            raise MateuTestError("The app shell keeps redirecting on " + self._where)
        nxt = _Frame()
        nxt.hops = frame.hops
        nxt.seed.update(seed)
        self._replace(frame, nxt)
        self._load(nxt, route, consumed, sst)


def n_type(node: dict) -> str:
    return _s(node.get("type"))


class Field:
    """A field on a ``Screen``. Typing changes the state the screen sends with its next action, as
    in a browser (an ``OnValueChange`` trigger of the screen fires)."""

    def __init__(self, screen: Screen, frame: _Frame, node: dict):
        self._screen = screen
        self._frame = frame
        self._node = node

    @property
    def id(self) -> str:
        return _s(self._node.get("fieldId"))

    @property
    def label(self) -> str:
        return _s(self._node.get("label"))

    @property
    def value(self) -> Any:
        """The current value, as the wire JSON (None when empty)."""
        return self._frame.state.get(self.id)

    @property
    def text(self) -> str:
        return _s(self.value)

    @property
    def data_type(self) -> str:
        return _s(self._node.get("dataType"))

    @property
    def stereotype(self) -> str:
        return _s(self._node.get("stereotype"))

    @property
    def read_only(self) -> bool:
        return self._node.get("readOnly") is True

    @property
    def required(self) -> bool:
        return self._node.get("required") is True

    @property
    def options(self) -> list[tuple[Any, str]]:
        """The choices of a select / radio, as (value, label), in order."""
        return [(o.get("value"), _s(o.get("label"))) for o in self._node.get("options") or []]

    def set(self, value: Any) -> Screen:
        """Types a value (a string, number, bool, enum, list…); refused on a read-only field."""
        if self.read_only:
            raise MateuTestError(f'Field "{self.id}" is not editable')
        self._frame.state[self.id] = _json(value)
        self._screen._start_gesture()
        for t in self._frame.server_side.get("triggers") or []:
            if _s(t.get("type")).lower() == "onvaluechange":
                prop = _s(t.get("propertyName"))
                if not prop or prop == self.id:
                    self._screen._dispatch(self._frame, _s(t.get("actionId")), {})
        return self._screen

    def __repr__(self) -> str:
        return f"{self.id} = {self.text}"


class Button:
    """A button on a ``Screen``."""

    def __init__(self, screen: Screen, frame: _Frame, node: dict):
        self._screen = screen
        self._frame = frame
        self._node = node

    @property
    def label(self) -> str:
        return _s(self._node.get("label"))

    @property
    def action_id(self) -> str:
        return _s(self._node.get("actionId")) or _s(self._node.get("id"))

    @property
    def enabled(self) -> bool:
        return self._node.get("disabled") is not True

    def press(self) -> Screen:
        """Presses it: runs its action (or follows its route) and applies the answer."""
        if not self.enabled:
            raise MateuTestError(f'Button "{self}" is disabled')
        route = _s(self._node.get("route"))
        if route:
            return self._screen.navigate(route)
        self._screen._start_gesture()
        self._screen._dispatch(self._frame, self.action_id, dict(self._node.get("parameters") or {}))
        return self._screen

    def __repr__(self) -> str:
        return f"{self.label} ({self.action_id})" if self.label else self.action_id


class Listing:
    """The listing on a ``Screen``: columns, the rows of the page on show, searching, opening."""

    def __init__(self, screen: Screen, frame: _Frame, crud: dict):
        self._screen = screen
        self._frame = frame
        self._crud = crud

    @property
    def _metadata(self) -> dict:
        return self._crud.get("metadata") or {}

    def _column_nodes(self) -> list[dict]:
        return _collect(self._metadata.get("columns"), lambda n: n.get("type") == "GridColumn")

    @property
    def columns(self) -> list[str]:
        return [_s(c.get("id")) for c in self._column_nodes()]

    @property
    def column_labels(self) -> list[str]:
        return [_s(c.get("label")) for c in self._column_nodes()]

    def _page(self) -> dict:
        own = (self._frame.data.get(_s(self._crud.get("id"))) or {})
        if isinstance(own, dict) and isinstance(own.get("page"), dict) and "content" in own["page"]:
            return own["page"]
        for v in self._frame.data.values():
            if isinstance(v, dict) and isinstance(v.get("page"), dict) and "content" in v["page"]:
                return v["page"]
        return {}

    @property
    def rows(self) -> list[Row]:
        content = [r for r in self._page().get("content") or [] if isinstance(r, dict) and "__mateuGroup" not in r]
        return [Row(self, i, r) for i, r in enumerate(content)]

    @property
    def total(self) -> int:
        total = self._page().get("totalElements")
        return int(total) if isinstance(total, (int, float)) else len(self.rows)

    def row(self, key: int | str) -> Row:
        """A row by position (0 = first) or by the text of one of its cells."""
        rows = self.rows
        if isinstance(key, int):
            if not 0 <= key < len(rows):
                raise MateuTestError(f"The listing shows {len(rows)} rows, no row {key}")
            return rows[key]
        for r in rows:
            if any(_s(v) == key for v in r.values.values()):
                return r
        raise MateuTestError(f'No row shows "{key}". Rows: {rows}')

    def search(self, text: str | None) -> Screen:
        self._frame.state["searchText"] = text or ""
        self._frame.state["page"] = 0
        return self._run_search()

    def filter(self, filter_id: str, value: Any) -> Screen:
        self._frame.state[filter_id] = _json(value)
        self._frame.state["page"] = 0
        return self._run_search()

    def page(self, page: int) -> Screen:
        self._frame.state["page"] = page
        return self._run_search()

    def _run_search(self) -> Screen:
        self._frame.seed_search()
        self._screen._start_gesture()
        self._screen._dispatch(self._frame, "search", {})
        return self._screen

    @property
    def _selection_key(self) -> str:
        return (_s(self._crud.get("id")) or "crud") + "_selected_items"

    def _select(self, row: Row) -> None:
        selected = list(self._frame.state.get(self._selection_key) or [])
        selected.append(dict(row.values))
        self._frame.state[self._selection_key] = selected

    def _open(self, row: Row) -> Screen:
        row_route = _s(self._metadata.get("rowRoute"))
        if row_route:
            for k, v in row.values.items():
                row_route = row_route.replace("${row." + k + "}", _s(v))
            return self._screen.navigate(row_route)
        action = next((_s(c.get("actionId")) for c in self._column_nodes() if _s(c.get("actionId"))), "")
        if not action:
            raise MateuTestError("The rows of this listing do not open (no rowRoute, no view column)")
        self._screen._start_gesture()
        parameters = dict(row.values)
        parameters["_clickedRow"] = dict(row.values)
        self._screen._dispatch(self._frame, action, parameters)
        return self._screen

    def __repr__(self) -> str:
        return f"Listing({self.columns}, {self.rows})"


class Row:
    """A row of a ``Listing``."""

    def __init__(self, listing: Listing, index: int, values: dict):
        self._listing = listing
        self.index = index
        self.values = values

    def __getitem__(self, column_id: str) -> Any:
        return self.values.get(column_id)

    def open(self) -> Screen:
        """Clicks it: opens the record."""
        return self._listing._open(self)

    def select(self) -> Row:
        """Ticks its selection box (for Delete and the bulk actions)."""
        self._listing._select(self)
        return self

    def __repr__(self) -> str:
        return repr(self.values)
