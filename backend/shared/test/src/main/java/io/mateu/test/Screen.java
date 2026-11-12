package io.mateu.test;

import static io.mateu.test.Json.bool;
import static io.mateu.test.Json.list;
import static io.mateu.test.Json.map;
import static io.mateu.test.Json.str;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Experimental;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Predicate;

/**
 * One browser tab on a Mateu UI, with no browser: what is on screen, and the gestures a user makes
 * on it. Opened by {@link MateuTest#open(String)}; every gesture ({@link Field#set}, {@link
 * Button#press()}, {@link Row#open()}, {@link #navigate(String)}…) sends the request a renderer
 * would send and applies the answer the way the renderers do — following an app shell to its home,
 * a crud to its listing and a navigation to its target, running the listing's first search, and
 * stacking dialogs and drawers over the page.
 *
 * <p>What it does NOT do is run what a renderer runs in the browser: client-side rules (a field
 * shown or disabled by an expression), REST sources called from the browser, scripts. Those are
 * reported as declared, never evaluated.
 *
 * <p>Not thread-safe: a screen is one user's tab.
 */
@Experimental("test harness (3.0)")
public final class Screen {

  private static final int MAX_HOPS = 8;

  private final MateuTest mateu;
  private final Identity identity;

  /** The page, then the overlays (dialogs, drawers) stacked over it. */
  private final List<Frame> frames = new ArrayList<>();

  private final List<Message> messages = new ArrayList<>();
  private final List<Command> commands = new ArrayList<>();
  private final Map<String, Object> appState = new LinkedHashMap<>();
  private Map<String, Object> app = Map.of();
  private String title = "";
  private String location = "";
  private int depth;

  /**
   * The loads an answer asks for (a shell's home, an announced component, a trigger), run once the
   * whole answer is applied — a browser fires them asynchronously, after the answer's commands.
   */
  private final java.util.ArrayDeque<List<Runnable>> later = new java.util.ArrayDeque<>();

  Screen(MateuTest mateu, Identity identity) {
    this.mateu = mateu;
    this.identity = identity;
    frames.add(new Frame());
  }

  // ── what is on screen ────────────────────────────────────────────────────────────────

  /**
   * The route the tab is on, as the browser's address bar would show it.
   *
   * @return the route
   */
  public String route() {
    return location;
  }

  /**
   * The window title (what {@code SetWindowTitle} set), else the page's own title.
   *
   * @return the title, empty when none
   */
  public String title() {
    if (!title.isBlank()) {
      return title;
    }
    return pageTitle();
  }

  /**
   * The title of the page header (the view's {@code @Title}), empty when it has none.
   *
   * @return the title
   */
  public String pageTitle() {
    for (var node : Json.collect(top().component, n -> n.containsKey("title"))) {
      var type = str(node.get("type"));
      if (type.equals("Page")
          || type.equals("Form")
          || type.equals("Crudl")
          || type.equals("App")) {
        var text = str(node.get("title"));
        if (!text.isBlank()) {
          return text;
        }
      }
    }
    return "";
  }

  /**
   * The app shell around the screen: its title and its menu entries (labels), empty when the screen
   * has no shell.
   *
   * @return the menu labels, in order
   */
  public List<String> menu() {
    var out = new ArrayList<String>();
    collectMenu(list(app.get("menu")), "", out);
    return out;
  }

  private static void collectMenu(List<Object> options, String prefix, List<String> out) {
    for (Object option : options) {
      var entry = map(option);
      var label = prefix + str(entry.get("label"));
      var submenu = list(entry.get("submenus"));
      if (submenu.isEmpty()) {
        submenu = list(entry.get("children"));
      }
      if (submenu.isEmpty()) {
        out.add(label);
      } else {
        collectMenu(submenu, label + " > ", out);
      }
    }
  }

  /**
   * Opens a menu entry of the app shell, by its label ({@code "Products"}, or {@code "Sales >
   * Orders"} inside a group).
   *
   * @param label the label
   * @return this screen, now showing the entry's screen
   */
  public Screen openMenu(String label) {
    var target = findMenu(list(app.get("menu")), "", label);
    if (target == null) {
      throw new AssertionError("No menu entry \"" + label + "\". The menu has: " + menu());
    }
    var route = str(target.get("route"));
    if (route.isBlank()) {
      route = str(target.get("path"));
    }
    return navigate(route);
  }

  private static Map<String, Object> findMenu(List<Object> options, String prefix, String label) {
    for (Object option : options) {
      var entry = map(option);
      var full = prefix + str(entry.get("label"));
      if (full.equals(label) || str(entry.get("label")).equals(label)) {
        if (list(entry.get("submenus")).isEmpty() && list(entry.get("children")).isEmpty()) {
          return entry;
        }
      }
      var nested = new ArrayList<>(list(entry.get("submenus")));
      nested.addAll(list(entry.get("children")));
      var found = findMenu(nested, full + " > ", label);
      if (found != null) {
        return found;
      }
    }
    return null;
  }

  /**
   * The fields on screen (the top dialog or drawer when one is open), in document order.
   *
   * @return the fields
   */
  public List<Field> fields() {
    var frame = top();
    var out = new ArrayList<Field>();
    // a listing's filters are reached through listing().filter(…), not as fields of the screen
    var filters = new java.util.IdentityHashMap<Object, Boolean>();
    for (var crud : crudsOf(frame)) {
      for (Object filter : list(map(crud.get("metadata")).get("filters"))) {
        filters.put(filter, Boolean.TRUE);
      }
    }
    for (var node : Json.collect(frame.component, n -> "FormField".equals(n.get("type")))) {
      if (!str(node.get("fieldId")).isBlank() && !filters.containsKey(node)) {
        out.add(new Field(this, frame, node));
      }
    }
    return out;
  }

  /**
   * A field, by its id ({@code name}) or its label ({@code "Name"}).
   *
   * @param idOrLabel the field id or its label
   * @return the field
   * @throws AssertionError when there is no such field (the message lists the ones there are)
   */
  public Field field(String idOrLabel) {
    return findField(idOrLabel)
        .orElseThrow(
            () ->
                new AssertionError(
                    "No field \""
                        + idOrLabel
                        + "\" on "
                        + where()
                        + ". Fields: "
                        + fields().stream().map(Field::describe).toList()));
  }

  /**
   * Whether a field is on screen — {@code false} for one the caller may not see
   * ({@code @EyesOnly}).
   *
   * @param idOrLabel the field id or its label
   * @return whether it is there
   */
  public boolean hasField(String idOrLabel) {
    return findField(idOrLabel).isPresent();
  }

  private Optional<Field> findField(String idOrLabel) {
    var all = fields();
    return all.stream()
        .filter(f -> f.id().equals(idOrLabel))
        .findFirst()
        .or(() -> all.stream().filter(f -> f.label().equalsIgnoreCase(idOrLabel)).findFirst());
  }

  /**
   * The buttons on screen (toolbar, form buttons, listing toolbar), in document order.
   *
   * @return the buttons
   */
  public List<Button> buttons() {
    var frame = top();
    var out = new ArrayList<Button>();
    for (var node : Json.collect(frame.component, n -> "Button".equals(n.get("type")))) {
      out.add(new Button(this, frame, node));
    }
    // the page header's toolbar and buttons carry actions without the Button wrapper type
    for (var node :
        Json.collect(
            frame.component,
            n ->
                n.containsKey("actionId")
                    && n.containsKey("label")
                    && !n.containsKey("type")
                    && !n.containsKey("fieldId"))) {
      if (out.stream().noneMatch(b -> b.node == node)) {
        out.add(new Button(this, frame, node));
      }
    }
    return out;
  }

  /**
   * A button, by its label ({@code "Save"}), its id or the action it runs ({@code "save"}).
   *
   * @param labelOrAction the label, id or action id
   * @return the button
   * @throws AssertionError when there is no such button (the message lists the ones there are)
   */
  public Button button(String labelOrAction) {
    return findButton(labelOrAction)
        .orElseThrow(
            () ->
                new AssertionError(
                    "No button \""
                        + labelOrAction
                        + "\" on "
                        + where()
                        + ". Buttons: "
                        + buttons().stream().map(Button::describe).toList()));
  }

  /**
   * Whether a button is on screen.
   *
   * @param labelOrAction the label, id or action id
   * @return whether it is there
   */
  public boolean hasButton(String labelOrAction) {
    return findButton(labelOrAction).isPresent();
  }

  private Optional<Button> findButton(String labelOrAction) {
    var all = buttons();
    return all.stream()
        .filter(b -> b.label().equals(labelOrAction))
        .findFirst()
        .or(() -> all.stream().filter(b -> b.label().equalsIgnoreCase(labelOrAction)).findFirst())
        .or(() -> all.stream().filter(b -> b.actionId().equals(labelOrAction)).findFirst());
  }

  /**
   * The listing on screen (a CRUD's, a {@code Listing}'s, a grid field's).
   *
   * @return the listing
   * @throws AssertionError when the screen shows none
   */
  public Listing listing() {
    var frame = top();
    var crudls = crudsOf(frame);
    if (crudls.isEmpty()) {
      throw new AssertionError("No listing on " + where());
    }
    return new Listing(this, frame, crudls.get(0));
  }

  /**
   * Whether the screen shows a listing.
   *
   * @return whether there is one
   */
  public boolean hasListing() {
    return !crudsOf(top()).isEmpty();
  }

  /** The listings of a frame: components whose metadata is a {@code Crud}. */
  private static List<Map<String, Object>> crudsOf(Frame frame) {
    return Json.collect(
        frame.component,
        n -> n.get("metadata") instanceof Map<?, ?> m && "Crud".equals(m.get("type")));
  }

  /**
   * Whether this text is shown anywhere on screen: a title, a label, a text, a value, a cell, a
   * message.
   *
   * @param text the text
   * @return whether some text on screen contains it
   */
  public boolean shows(String text) {
    var frame = top();
    if (title().contains(text)) {
      return true;
    }
    if (messages.stream().anyMatch(m -> m.text().contains(text) || m.title().contains(text))) {
      return true;
    }
    for (Object source : List.of(frame.component, frame.state, frame.data)) {
      if (containsText(source, text)) {
        return true;
      }
    }
    return false;
  }

  private static boolean containsText(Object node, String text) {
    if (node instanceof String s) {
      return s.contains(text);
    }
    if (node instanceof Map<?, ?> m) {
      for (var entry : m.entrySet()) {
        var key = String.valueOf(entry.getKey());
        // identifiers are not text a user reads
        if (key.equals("id") && entry.getValue() instanceof String) {
          continue;
        }
        if (key.equals("type") || key.equals("serverSideType") || key.endsWith("Id")) {
          continue;
        }
        if (containsText(entry.getValue(), text)) {
          return true;
        }
      }
      return false;
    }
    if (node instanceof Iterable<?> it) {
      for (var item : it) {
        if (containsText(item, text)) {
          return true;
        }
      }
      return false;
    }
    return node != null && !(node instanceof Boolean) && String.valueOf(node).equals(text);
  }

  /**
   * The messages (toasts) the last gesture produced — every answer since it, follow-up loads
   * included.
   *
   * @return the messages
   */
  public List<Message> messages() {
    return List.copyOf(messages);
  }

  /**
   * The last message the last gesture produced.
   *
   * @return the message
   * @throws AssertionError when it produced none
   */
  public Message lastMessage() {
    if (messages.isEmpty()) {
      throw new AssertionError("The last gesture showed no message, on " + where());
    }
    return messages.get(messages.size() - 1);
  }

  /**
   * The commands the server sent for the last gesture ({@code NavigateTo}, {@code SetWindowTitle},
   * {@code CloseModal}…), already applied.
   *
   * @return the commands
   */
  public List<Command> commands() {
    return List.copyOf(commands);
  }

  /**
   * Whether a dialog or drawer is open over the page.
   *
   * @return whether an overlay is open
   */
  public boolean hasOverlay() {
    return frames.size() > 1;
  }

  /**
   * The title of the dialog or drawer open over the page.
   *
   * @return its title, empty when none is open or it has none
   */
  public String overlayTitle() {
    return hasOverlay() ? top().overlayTitle : "";
  }

  /**
   * Closes the top dialog or drawer the way the ✕ does (nothing is sent to the server).
   *
   * @return this screen
   */
  public Screen closeOverlay() {
    if (!hasOverlay()) {
      throw new AssertionError("No dialog or drawer is open on " + where());
    }
    frames.remove(frames.size() - 1);
    return this;
  }

  /**
   * The state the screen would send with its next action: the field values by id (a copy).
   *
   * @return the state
   */
  public Map<String, Object> state() {
    return new LinkedHashMap<>(top().state);
  }

  /**
   * The component tree on screen, as the wire JSON — for an assertion the screen does not offer.
   *
   * @return the component (maps and lists)
   */
  public Map<String, Object> component() {
    return top().component;
  }

  // ── gestures ─────────────────────────────────────────────────────────────────────────

  /**
   * Goes to a route, like typing it in the address bar (the dialogs and drawers close).
   *
   * @param route the route
   * @return this screen
   */
  public Screen navigate(String route) {
    startGesture();
    frames.subList(1, frames.size()).clear();
    var page = new Frame();
    frames.set(0, page);
    location = route;
    // a fresh load, as a browser landing on the URL sends it
    load(page, route, "_empty", "");
    return this;
  }

  /**
   * Runs an action of the screen by id, as a button or a trigger would.
   *
   * @param actionId the action id
   * @return this screen
   */
  public Screen run(String actionId) {
    return run(actionId, Map.of());
  }

  /**
   * Runs an action of the screen by id, with parameters.
   *
   * @param actionId the action id
   * @param parameters the action's parameters
   * @return this screen
   */
  public Screen run(String actionId, Map<String, Object> parameters) {
    startGesture();
    dispatch(top(), actionId, parameters);
    return this;
  }

  void startGesture() {
    messages.clear();
    commands.clear();
  }

  // ── the client ───────────────────────────────────────────────────────────────────────

  Frame top() {
    return frames.get(frames.size() - 1);
  }

  String where() {
    return location.isEmpty() ? "the root" : location;
  }

  void dispatch(Frame frame, String actionId, Map<String, Object> parameters) {
    if (!later.isEmpty()) {
      later.peek().add(() -> dispatchNow(frame, actionId, parameters));
      return;
    }
    dispatchNow(frame, actionId, parameters);
  }

  private void dispatchNow(Frame frame, String actionId, Map<String, Object> parameters) {
    var action = frame.action(actionId);
    if (action != null && !map(action.get("restAction")).isEmpty()) {
      throw new UnsupportedOperationException(
          "\""
              + actionId
              + "\" calls a REST endpoint from the browser ("
              + str(map(map(action.get("restAction")).get("source")).get("url"))
              + "): the harness does not call it");
    }
    var target = frame.targetFor(actionId);
    var rq =
        RunActionRqDto.builder()
            .route(target.route)
            .consumedRoute(target.consumedRoute)
            .serverSideType(target.serverSideType.isEmpty() ? null : target.serverSideType)
            .initiatorComponentId(frame.componentId.isEmpty() ? "ux" : frame.componentId)
            .componentState(new LinkedHashMap<>(frame.state))
            .appState(new LinkedHashMap<>(appState))
            .parameters(new LinkedHashMap<>(parameters))
            .actionId(actionId)
            .build();
    send(frame, rq);
  }

  private void load(Frame frame, String route, String consumedRoute, String serverSideType) {
    if (!later.isEmpty()) {
      later.peek().add(() -> loadNow(frame, route, consumedRoute, serverSideType));
      return;
    }
    loadNow(frame, route, consumedRoute, serverSideType);
  }

  private void loadNow(Frame frame, String route, String consumedRoute, String serverSideType) {
    frame.route = route;
    frame.consumedRoute = consumedRoute;
    frame.serverSideType = serverSideType;
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(consumedRoute)
            .serverSideType(serverSideType.isEmpty() ? null : serverSideType)
            .initiatorComponentId(frame.componentId.isEmpty() ? "ux" : frame.componentId)
            .componentState(new LinkedHashMap<>(frame.seed))
            .appState(new LinkedHashMap<>(appState))
            .parameters(Map.of())
            .actionId("")
            .build();
    send(frame, rq);
  }

  private void send(Frame frame, RunActionRqDto rq) {
    if (++depth > 40) {
      depth = 0;
      throw new AssertionError(
          "The UI keeps loading (more than 40 chained requests) on " + where());
    }
    try {
      trace(
          "→ "
              + MateuTest.describe(rq)
              + " ["
              + rq.consumedRoute()
              + " | "
              + rq.serverSideType()
              + "]");
      for (var answer : mateu.exchangeAll(rq, identity)) {
        trace("← " + answer);
        var followUps = new ArrayList<Runnable>();
        later.push(followUps);
        try {
          apply(frame, answer);
        } finally {
          later.pop();
        }
        followUps.forEach(Runnable::run);
      }
    } finally {
      depth--;
    }
  }

  private static void trace(String line) {
    if (Boolean.getBoolean("mateu.test.trace")) {
      System.out.println(
          "[mateu-test] " + (line.length() > 4000 ? line.substring(0, 4000) + "…" : line));
    }
  }

  private void apply(Frame frame, Map<String, Object> answer) {
    for (Object fragment : list(answer.get("fragments"))) {
      applyFragment(frame, map(fragment));
    }
    for (Object message : list(answer.get("messages"))) {
      var m = map(message);
      messages.add(new Message(str(m.get("variant")), str(m.get("title")), str(m.get("text")), m));
    }
    var state = map(answer.get("appState"));
    if (!state.isEmpty()) {
      appState.putAll(state);
    }
    for (Object command : list(answer.get("commands"))) {
      var c = map(command);
      var cmd = new Command(str(c.get("type")), c.get("data"));
      commands.add(cmd);
      applyCommand(frame, cmd);
    }
  }

  private void applyCommand(Frame frame, Command command) {
    switch (command.type()) {
      case "SetWindowTitle" -> title = str(command.data());
      case "NavigateTo" -> {
        var target = str(command.data());
        if (!target.isBlank()) {
          navigateKeepingMessages(target);
        }
      }
      case "PushStateToHistory" -> {
        var route = str(command.data());
        if (!route.isBlank()) {
          location = route;
        }
      }
      case "CloseModal" -> {
        if (frames.size() > 1 && frames.contains(frame) && frame != frames.get(0)) {
          frames.remove(frame);
        } else if (frames.size() > 1) {
          frames.remove(frames.size() - 1);
        }
      }
      case "RunAction" -> {
        var data = map(command.data());
        var actionId = data.isEmpty() ? str(command.data()) : str(data.get("actionId"));
        if (!actionId.isBlank()) {
          var host = frames.contains(frame) ? frame : top();
          dispatch(host, actionId, map(data.get("parameters")));
        }
      }
      default -> {
        // MarkAsDirty, MarkAsClean, DispatchEvent, Announce…: nothing to draw without a browser
      }
    }
  }

  private void navigateKeepingMessages(String route) {
    frames.subList(1, frames.size()).clear();
    var page = new Frame();
    frames.set(0, page);
    location = route;
    load(page, route, "_empty", "");
  }

  private void applyFragment(Frame frame, Map<String, Object> fragment) {
    var component = map(fragment.get("component"));
    var state = map(fragment.get("state"));
    var data = fragment.get("data");
    if (component.isEmpty()) {
      if (data instanceof Map<?, ?> d && !d.isEmpty()) {
        frame.data.putAll(map(d));
        return;
      }
      if (state.containsKey("_route") && state.containsKey("_componentRoute")) {
        // a crud orchestrator moving between its own routes (list, /new, /{id}, /{id}/edit)
        var base = str(state.get("_componentRoute"));
        if (base.isEmpty()) {
          base = frame.consumedRoute;
        }
        var inner = str(state.get("_route"));
        // "list" names the crud's listing, which lives at the crud's own route
        var full = inner.equals("list") ? base : base + inner;
        var sst =
            !frame.orchestratorServerSideType.isEmpty()
                ? frame.orchestratorServerSideType
                : frame.serverSideType;
        location = full;
        var next = new Frame();
        next.seed.putAll(frame.seed);
        // what the crud's inner views do not own bubbles to the crud itself
        next.orchestratorServerSideType = sst;
        next.orchestratorRoute = base;
        replace(frame, next);
        load(next, full, base, sst);
        return;
      }
      frame.state.putAll(state);
      return;
    }
    var metadata = map(component.get("metadata"));
    var kind = str(metadata.get("type"));
    if ("Add".equals(str(fragment.get("action")))
        && (kind.equals("Dialog") || kind.equals("Drawer"))) {
      var overlay = new Frame();
      overlay.opener = frame;
      overlay.route = frame.route;
      overlay.consumedRoute = frame.consumedRoute;
      overlay.serverSideType = frame.serverSideType;
      overlay.componentId = frame.componentId;
      overlay.actions.addAll(frame.actions);
      overlay.overlayTitle = str(metadata.get("headerTitle"));
      overlay.component = component;
      overlay.state.putAll(map(metadata.get("initialData")));
      overlay.state.putAll(state);
      frames.add(overlay);
      // the overlay's own content may be a server-side component of its own
      var inner =
          Json.collect(component, n -> "ServerSide".equals(n.get("type")) && n != component);
      if (!inner.isEmpty()) {
        overlay.adopt(inner.get(0));
      }
      return;
    }
    if (kind.equals("Notification")) {
      messages.add(
          new Message(
              str(metadata.get("variant")),
              str(metadata.get("title")),
              str(metadata.get("text")),
              metadata));
      return;
    }
    render(frame, component, state, data);
  }

  private void replace(Frame old, Frame next) {
    var index = frames.indexOf(old);
    if (index >= 0) {
      frames.set(index, next);
    }
  }

  private void render(
      Frame frame, Map<String, Object> component, Map<String, Object> state, Object data) {
    var metadata = map(component.get("metadata"));
    if (!"ServerSide".equals(component.get("type")) && "App".equals(metadata.get("type"))) {
      followHome(frame, metadata, Map.of());
      return;
    }
    if (!"ServerSide".equals(component.get("type"))) {
      frame.component = component;
      frame.state.putAll(state);
      return;
    }
    var children = list(component.get("children"));
    if (children.isEmpty()) {
      // a component announced, loaded on its own
      var next = new Frame();
      next.componentId = str(component.get("id"));
      next.seed.putAll(frame.seed);
      replace(frame, next);
      load(
          next,
          str(component.get("route")),
          frame.consumedRoute,
          str(component.get("serverSideType")));
      return;
    }
    var first = map(children.get(0));
    var firstMetadata = map(first.get("metadata"));
    if ("ClientSide".equals(first.get("type")) && "App".equals(firstMetadata.get("type"))) {
      // a crud's (or an island's) chrome-less shell: what it shows is its home
      var seed = new LinkedHashMap<String, Object>(map(component.get("initialData")));
      seed.putAll(state);
      followHome(frame, firstMetadata, seed);
      return;
    }
    frame.adopt(component);
    frame.state.putAll(state);
    if (data instanceof Map<?, ?> d) {
      frame.data.putAll(map(d));
    }
    // the screen's OnLoad triggers (a listing's first search, @Trigger(OnLoad))
    for (Object trigger : list(component.get("triggers"))) {
      var t = map(trigger);
      if (!"OnLoad".equalsIgnoreCase(str(t.get("type")))) {
        continue;
      }
      if (t.get("timeoutMillis") instanceof Number n && n.intValue() > 0) {
        continue;
      }
      var actionId = str(t.get("actionId"));
      if (actionId.isBlank()) {
        continue;
      }
      if (actionId.equals("search")) {
        frame.seedSearch();
      }
      dispatch(frame, actionId, Map.of());
    }
  }

  private void followHome(Frame frame, Map<String, Object> appMetadata, Map<String, Object> seed) {
    if (!"MEDIATOR".equals(str(appMetadata.get("variant"))) || app.isEmpty()) {
      app = appMetadata;
    }
    var route = str(appMetadata.get("homeRoute"));
    var consumed = str(appMetadata.get("homeConsumedRoute"));
    var sst = str(appMetadata.get("homeServerSideType"));
    if (sst.isEmpty()) {
      sst = str(appMetadata.get("serverSideType"));
    }
    if (route.isEmpty() && sst.isEmpty()) {
      return;
    }
    if (++frame.hops > MAX_HOPS) {
      throw new AssertionError("The app shell keeps redirecting on " + where());
    }
    var next = new Frame();
    next.hops = frame.hops;
    next.seed.putAll(seed);
    replace(frame, next);
    load(next, route, consumed, sst);
  }

  /** One place a component is drawn: the page, or a dialog/drawer over it. */
  static final class Frame {
    String route = "";
    String consumedRoute = "";
    String serverSideType = "";
    String componentId = "";
    String orchestratorServerSideType = "";
    String orchestratorRoute = "";
    String overlayTitle = "";
    Frame opener;
    int hops;
    Map<String, Object> component = Map.of();
    Map<String, Object> serverSide = Map.of();
    final Map<String, Object> state = new LinkedHashMap<>();
    final Map<String, Object> data = new LinkedHashMap<>();
    final Map<String, Object> seed = new LinkedHashMap<>();
    final List<Map<String, Object>> actions = new ArrayList<>();

    Map<String, Object> ruleSource() {
      return serverSide;
    }

    void adopt(Map<String, Object> serverSide) {
      this.serverSide = serverSide;
      if (component.isEmpty() || opener == null) {
        component = serverSide;
      }
      var id = str(serverSide.get("id"));
      if (!id.isEmpty()) {
        componentId = id;
      }
      var sst = str(serverSide.get("serverSideType"));
      if (!sst.isEmpty()) {
        if (opener == null) {
          serverSideType = sst;
        } else {
          // inside an overlay: what the content does not own bubbles to the opener
          serverSideType = sst;
        }
      }
      var routeOfComponent = str(serverSide.get("route"));
      if (!routeOfComponent.isEmpty() && opener == null && route.isEmpty()) {
        route = routeOfComponent;
      }
      actions.clear();
      for (Object a : list(serverSide.get("actions"))) {
        actions.add(map(a));
      }
      var initial = map(serverSide.get("initialData"));
      state.putAll(initial);
      var componentRoute = str(initial.get("_componentRoute"));
      if (componentRoute.isEmpty()) {
        componentRoute = str(initial.get("componentRoute"));
      }
      if (initial.containsKey("_componentRoute")
          && !sst.isEmpty()
          && orchestratorServerSideType.isEmpty()) {
        orchestratorServerSideType = sst;
        orchestratorRoute = componentRoute;
      }
    }

    Map<String, Object> action(String actionId) {
      for (var a : actions) {
        if (actionId.equals(a.get("id"))) {
          return a;
        }
      }
      return null;
    }

    boolean owns(String actionId) {
      for (var a : actions) {
        var id = str(a.get("id"));
        if (id.equals(actionId)
            || (id.endsWith("*") && actionId.startsWith(id.substring(0, id.length() - 1)))) {
          return true;
        }
      }
      return false;
    }

    /** Where an action goes: this component, or — unowned — its opener / orchestrator. */
    Frame targetFor(String actionId) {
      var bubbles =
          !owns(actionId)
              || bool(Objects.requireNonNullElse(action(actionId), Map.of()).get("bubble"));
      if (bubbles && opener != null) {
        var target = new Frame();
        target.route = opener.route;
        target.consumedRoute = opener.consumedRoute;
        target.serverSideType = opener.serverSideType;
        return target;
      }
      if (bubbles
          && !orchestratorServerSideType.isEmpty()
          && !orchestratorServerSideType.equals(serverSideType)
          && route.startsWith(orchestratorRoute)) {
        var target = new Frame();
        target.route = route;
        target.consumedRoute = consumedRoute;
        target.serverSideType = orchestratorServerSideType;
        return target;
      }
      return this;
    }

    void seedSearch() {
      state.putIfAbsent("page", 0);
      state.putIfAbsent("size", 10);
      state.putIfAbsent("sort", List.of());
      state.putIfAbsent("searchText", "");
    }
  }

  static <T> Optional<T> first(List<T> items, Predicate<T> accept) {
    return items.stream().filter(accept).findFirst();
  }
}
