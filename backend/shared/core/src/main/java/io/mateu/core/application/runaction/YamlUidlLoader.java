package io.mateu.core.application.runaction;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.uidl.fluent.Component;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.io.InputStream;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Loads a page defined in a YAML file under {@code specs/ui/} on the classpath.
 *
 * <p>Two shapes are supported:
 *
 * <ul>
 *   <li><b>Bare layout</b> (legacy): the whole file is a component tree ({@code type: ...}). It
 *       renders as a static, unbound page — good for help/landing screens with no behaviour.
 *   <li><b>Page envelope</b>: a {@code layout:} key holds the component tree and an optional {@code
 *       viewModel:} key names a Java class (the canonical vocabulary of coherence-plan #5; {@code
 *       modelView:} is accepted as a deprecated alias). When present, that class is instantiated as
 *       the page's view model — it supplies the state, actions, validations and rules — while the
 *       YAML supplies the layout. This is the inverse of {@code @UISpec} (there the class points at
 *       the YAML; here the YAML points at the class), so a page can be authored as a file that
 *       references a plain, unannotated logic class.
 * </ul>
 *
 * The binding between the YAML layout and the ModelView is by convention, exactly as everywhere
 * else in Mateu: a {@code FormField id="name"} binds to the ModelView's {@code name} property and a
 * {@code Button actionId="save"} to its {@code save()} method.
 */
@Slf4j
@Named
@Singleton
public class YamlUidlLoader {

  /** A parsed page spec: the layout, plus the ModelView class name when the YAML declares one. */
  /**
   * A parsed page spec.
   *
   * @param layout an explicit layout — a SNAPSHOT, which takes the screen out of inference for good
   * @param delta what a human changed about the INFERRED layout. The two are alternatives: a delta
   *     lets the screen keep re-deriving, so a field the model grows later still appears. See
   *     {@link io.mateu.uidl.data.LayoutDelta}.
   */
  public record YamlPageSpec(
      String modelView,
      Component layout,
      io.mateu.uidl.data.LayoutDelta delta,
      java.util.List<io.mateu.uidl.fluent.Action> actions,
      java.util.List<io.mateu.uidl.fluent.Trigger> triggers,
      JsonNode source,
      java.util.Set<String> refusedActions,
      java.util.Set<String> lockedFields) {

    public YamlPageSpec {
      refusedActions = refusedActions == null ? java.util.Set.of() : refusedActions;
      lockedFields = lockedFields == null ? java.util.Set.of() : lockedFields;
    }

    public YamlPageSpec(
        String modelView,
        Component layout,
        io.mateu.uidl.data.LayoutDelta delta,
        java.util.List<io.mateu.uidl.fluent.Action> actions,
        java.util.List<io.mateu.uidl.fluent.Trigger> triggers) {
      this(modelView, layout, delta, actions, triggers, null, null, null);
    }

    /**
     * Whether this spec depends on WHO asks or in which LANGUAGE — it declares access keys or
     * {@code ${i18n.…}} expressions — and so must be re-derived per request ({@link
     * YamlUidlLoader#loadSpec(String, io.mateu.uidl.interfaces.HttpRequest)}).
     */
    public boolean dependsOnRequest() {
      return source != null;
    }

    public YamlPageSpec(String modelView, Component layout) {
      this(
          modelView,
          layout,
          io.mateu.uidl.data.LayoutDelta.empty(),
          java.util.List.of(),
          java.util.List.of());
    }

    public YamlPageSpec(String modelView, Component layout, io.mateu.uidl.data.LayoutDelta delta) {
      this(modelView, layout, delta, java.util.List.of(), java.util.List.of());
    }

    public YamlPageSpec(
        String modelView,
        Component layout,
        io.mateu.uidl.data.LayoutDelta delta,
        java.util.List<io.mateu.uidl.fluent.Action> actions) {
      this(modelView, layout, delta, actions, java.util.List.of());
    }
  }

  // Specs are static files, so parse once and cache by (normalized) route. A miss is cached as
  // NONE so an unmatched route — checked on every request that has no Java class — doesn't hit the
  // classpath each time. (Editing a YAML during development needs a restart to be picked up.)
  private static final YamlPageSpec NONE = new YamlPageSpec(null, null);

  private final ObjectMapper mapper;
  private final ConcurrentHashMap<String, YamlPageSpec> byRoute = new ConcurrentHashMap<>();

  /**
   * The mount's route registry. When a route's entry names a {@code definition}, THAT file is the
   * layout — instead of the {@code specs/ui/<route>.yaml} convention, which ties a screen's layout
   * to its URL and so prevents one definition from serving several routes.
   */
  private final RouteRegistry routeRegistry;

  /** The translation catalogue {@code ${i18n.…}} expressions are resolved against. */
  private final io.mateu.core.application.i18n.TranslationRegistry translations;

  @jakarta.inject.Inject
  public YamlUidlLoader(
      RouteRegistry routeRegistry,
      io.mateu.core.application.i18n.TranslationRegistry translations) {
    this.mapper = YamlUidlMapperFactory.create();
    this.routeRegistry = routeRegistry;
    this.translations = translations;
  }

  public YamlUidlLoader(RouteRegistry routeRegistry) {
    this(routeRegistry, new io.mateu.core.application.i18n.TranslationRegistry());
  }

  /** Without a registry: the convention alone, as before it existed. */
  public YamlUidlLoader() {
    this(new RouteRegistry());
  }

  /**
   * Parse a YAML page from raw TEXT (not the classpath) into its layout component — the
   * live-preview path for the visual builder, which sends the editor's current, unsaved content.
   * Envelope-aware: unwraps {@code layout:} when present, else treats the whole doc as the layout.
   * Null on blank/invalid input.
   */
  public Component parseText(String yaml) {
    if (yaml == null || yaml.isBlank()) {
      return null;
    }
    try {
      return layoutOf(mapper.readTree(yaml));
    } catch (Exception e) {
      log.warn("Failed to parse YAML preview: {}", e.getMessage());
      return null;
    }
  }

  /** Load a layout from an explicit spec path (the {@code @UISpec} path); envelope-aware. */
  public Component loadFromSpec(String specPath) {
    // @UISpec paths come from annotations — a finite set — and the file is static: parse it once
    // instead of on every render of the class (the route-keyed specs were already cached).
    var cached =
        bySpecPath.computeIfAbsent(specPath, path -> Optional.ofNullable(parseSpecFile(path)));
    return cached.orElse(null);
  }

  private final ConcurrentHashMap<String, Optional<Component>> bySpecPath =
      new ConcurrentHashMap<>();

  private Component parseSpecFile(String specPath) {
    var resource = resolve(specPath);
    if (resource == null) {
      log.warn("No YAML spec found at classpath:{}", specPath);
      return null;
    }
    try (var is = resource) {
      return layoutOf(mapper.readTree(is));
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", specPath, e.getMessage());
      return null;
    }
  }

  /**
   * The parsed spec for a route ({@code specs/ui/<route>.yaml}), or {@code null} when there is
   * none.
   */
  public YamlPageSpec loadSpec(String route) {
    var key = normalize(route);
    var spec = byRoute.get(key);
    if (spec == null) {
      spec = parseSpec(key);
      // The key is the CONCRETE request route — customers/1, customers/2, … — so an uncapped map
      // grows with every record anyone opens (and with any path a client cares to send). Past the
      // cap, answer without remembering: correct, just one classpath lookup slower.
      if (byRoute.size() < MAX_CACHED_ROUTES) {
        byRoute.putIfAbsent(key, spec);
      }
    }
    return spec == NONE ? null : spec;
  }

  static final int MAX_CACHED_ROUTES = 4096;

  /**
   * The server-side half of the YAML access keys, applied to every request before anything runs:
   *
   * <ul>
   *   <li>a route whose {@code access:} (or an ancestor's) the caller does not satisfy is refused
   *       with 403, exactly like a class-level {@code @EyesOnly} on a {@code @UI};
   *   <li>a declared action whose {@code access:} the caller does not satisfy is refused with 403
   *       when it reaches the server anyway (dispatched, or proxied through {@code __restfetch__});
   *   <li>the values of fields hidden or made read-only for the caller are dropped from the
   *       incoming state, so a locked field keeps its server value rather than the client's.
   * </ul>
   *
   * @return the command to run (possibly with a narrowed state)
   * @throws io.mateu.core.application.security.MateuForbiddenException when refused
   */
  public RunActionCommand guard(RunActionCommand command) {
    var route = command.route();
    if (route == null) {
      return command;
    }
    var httpRequest = command.httpRequest();
    var refusing = routeRegistry.refusingEntry(route, httpRequest);
    if (refusing != null) {
      log.warn(
          "Refused request: route '{}' declares access: and the caller's token does not satisfy"
              + " it",
          refusing.route());
      throw new io.mateu.core.application.security.MateuForbiddenException(
          "route not allowed for caller: " + refusing.route());
    }
    var path = normalize(route);
    var spec = loadSpec(path);
    if (spec == null || !spec.dependsOnRequest()) {
      return command;
    }
    var personal = loadSpec(path, httpRequest);
    if (personal == null) {
      return command;
    }
    var actionId = command.actionId();
    if (actionId != null && personal.refusedActions().contains(actionId)) {
      throw refusedAction(actionId);
    }
    if ("__restfetch__".equals(actionId) && httpRequest != null) {
      var rq = httpRequest.runActionRq();
      var sourceId =
          rq != null && rq.parameters() != null ? rq.parameters().get("_sourceId") : null;
      if (sourceId != null && personal.refusedActions().contains(String.valueOf(sourceId))) {
        throw refusedAction(String.valueOf(sourceId));
      }
    }
    if (!personal.lockedFields().isEmpty()
        && command.componentState() != null
        && personal.lockedFields().stream().anyMatch(command.componentState()::containsKey)) {
      var narrowed = new java.util.LinkedHashMap<>(command.componentState());
      personal.lockedFields().forEach(narrowed::remove);
      return command.withComponentState(narrowed);
    }
    return command;
  }

  /** The action catalogue, when there is a bean context to ask (null in a bare unit test). */
  private static ActionRegistry actionRegistry() {
    try {
      return io.mateu.uidl.di.MateuBeanProvider.getBean(ActionRegistry.class);
    } catch (Throwable t) {
      return null;
    }
  }

  /** Whether {@code tree} names a catalogue action that declares {@code access:}. */
  private static boolean referencesRestrictedCatalogueAction(JsonNode tree) {
    var registry = actionRegistry();
    if (registry == null || !registry.restrictsAny()) {
      return false;
    }
    return catalogueIdsNamedBy(tree).stream().anyMatch(registry.restrictedIds()::contains);
  }

  /**
   * The action ids {@code tree} names that its own {@code actions:} do not declare — OWNER FIRST:
   * an id the page declares is the page's, never the catalogue's.
   */
  private static java.util.Set<String> catalogueIdsNamedBy(JsonNode tree) {
    var ids = new java.util.LinkedHashSet<String>();
    ActionRegistry.collectIds(tree, ids);
    var own = tree == null ? null : tree.get("actions");
    if (own != null && own.isArray()) {
      own.forEach(action -> ids.remove(action.path("id").asText()));
    }
    return ids;
  }

  /**
   * The catalogue actions {@code tree} names that the caller may NOT run — enforced like a page's
   * own restricted actions: buttons disabled, a call that reaches the server refused.
   */
  private static java.util.Set<String> catalogueActionsRefusedIn(
      JsonNode tree, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var registry = actionRegistry();
    if (registry == null || !registry.restrictsAny()) {
      return java.util.Set.of();
    }
    var ids = catalogueIdsNamedBy(tree);
    ids.retainAll(registry.refusedFor(httpRequest));
    return ids;
  }

  private static io.mateu.core.application.security.MateuForbiddenException refusedAction(
      String actionId) {
    log.warn(
        "Refused request: action '{}' declares access: and the caller's token does not satisfy it",
        actionId);
    return new io.mateu.core.application.security.MateuForbiddenException(
        "action not allowed for caller: " + actionId);
  }

  /**
   * The spec for a route AS THIS REQUEST SEES IT. The cached spec is shared by everybody; one that
   * declares access keys ({@code eyesOnly:}, {@code readOnlyUnless:}, {@code disabledUnless:},
   * {@code access:}) or {@code ${i18n.…}} expressions is re-derived from its source tree for the
   * caller's identity and locale — on the server, so what reaches the wire is already what this
   * caller may see, in their language.
   */
  public YamlPageSpec loadSpec(String route, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var spec = loadSpec(route);
    if (spec == null || !spec.dependsOnRequest()) {
      return spec;
    }
    try {
      var tree = spec.source();
      java.util.Set<String> refused = java.util.Set.of();
      java.util.Set<String> locked = java.util.Set.of();
      var catalogueRefused = catalogueActionsRefusedIn(tree, httpRequest);
      if (io.mateu.core.application.security.YamlAccess.declaresAccess(tree)
          || !catalogueRefused.isEmpty()) {
        var applied =
            io.mateu.core.application.security.YamlAccess.apply(
                tree,
                httpRequest,
                path -> routeRegistry.isReachable(path, httpRequest),
                catalogueRefused);
        tree = applied.tree();
        refused = applied.refusedActions();
        locked = applied.lockedFields();
      } else {
        tree = tree.deepCopy();
      }
      if (tree == null) {
        return null;
      }
      if (!io.mateu.core.application.i18n.TranslationRegistry.isRaw(httpRequest)) {
        translations.translateTree(
            tree, io.mateu.core.application.i18n.TranslationRegistry.localeOf(httpRequest));
      }
      return new YamlPageSpec(
          spec.modelView(),
          layoutOf(tree),
          deltaOf(tree),
          actionsOf(mapper, tree),
          triggersOf(tree),
          null,
          refused,
          locked);
    } catch (Exception e) {
      log.warn("Failed to personalise the YAML spec for {}: {}", route, e.getMessage());
      return spec;
    }
  }

  int cachedRoutes() {
    return byRoute.size();
  }

  /**
   * The YAML layout for {@code route}, but only when the route's spec declares {@code modelView}
   * and it matches {@code modelViewClass} — i.e. this instance IS the page's declared ModelView.
   * This is what re-applies the YAML layout on an action round-trip (which routes by
   * serverSideType), not just on the first load. Returns {@code null} otherwise.
   */
  public Component layoutForRoute(String route, Class<?> modelViewClass) {
    return layoutForRoute(route, modelViewClass, null);
  }

  /** As {@link #layoutForRoute(String, Class)}, as the request sees it (access keys, i18n). */
  public Component layoutForRoute(
      String route, Class<?> modelViewClass, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var spec = httpRequest == null ? loadSpec(route) : loadSpec(route, httpRequest);
    if (spec == null || spec.modelView() == null || modelViewClass == null) {
      return null;
    }
    return spec.modelView().equals(modelViewClass.getName()) ? spec.layout() : null;
  }

  /**
   * The layout DELTA for {@code route}, under the same "this instance IS the page's declared
   * ModelView" rule as {@link #layoutForRoute}. Empty when the route has no spec, no delta, or
   * belongs to another class — so the caller can apply it unconditionally.
   */
  public io.mateu.uidl.data.LayoutDelta deltaForRoute(String route, Class<?> modelViewClass) {
    var spec = loadSpec(route);
    if (spec == null || spec.modelView() == null || modelViewClass == null) {
      return io.mateu.uidl.data.LayoutDelta.empty();
    }
    return spec.modelView().equals(modelViewClass.getName())
        ? spec.delta()
        : io.mateu.uidl.data.LayoutDelta.empty();
  }

  private YamlPageSpec parseSpec(String normalizedRoute) {
    var entry = routeRegistry.authored().match(normalizedRoute).map(match -> match.entry());
    var declaredDefinition =
        entry.map(io.mateu.uidl.data.RouteEntry::definition).filter(d -> !d.isBlank()).orElse(null);
    var yamlPath =
        declaredDefinition != null
            ? definitionPath(declaredDefinition)
            : "specs/ui/" + normalizedRoute + ".yaml";
    var resource = resolve(yamlPath);
    if (resource == null) {
      log.debug("No YAML spec found at {}", yamlPath);
      return NONE;
    }
    try (var is = resource) {
      var root = mapper.readTree(is);
      if (root == null) {
        return NONE;
      }
      // The definition is layout; the binding to a view model belongs to the route entry. A YAML
      // that declares the view model inline keeps working and wins, so nothing that exists today
      // changes — but a definition shared by several routes must NOT name one, or it could only
      // ever serve the class it names.
      // Vocabulary (coherence-plan #5): the canonical key is `viewModel:` (unifying the two names
      // for the one concept — the server class of state + actions). `modelView:` is the DEPRECATED
      // ALIAS, still accepted so every existing definition keeps working; `viewModel:` wins if both
      // are present.
      var modelView =
          root.hasNonNull("viewModel")
              ? root.get("viewModel").asText()
              : root.hasNonNull("modelView") ? root.get("modelView").asText() : null;
      if (modelView == null) {
        modelView =
            entry
                .map(io.mateu.uidl.data.RouteEntry::viewModel)
                .filter(viewModel -> !viewModel.isBlank())
                .orElse(null);
      }
      var layout = layoutOf(root);
      var delta = deltaOf(root);
      if (layout == null && delta.isEmpty()) {
        return NONE; // neither a layout nor a delta: nothing this file can contribute
      }
      var actions = actionsOf(mapper, root);
      var triggers = triggersOf(root);
      log.debug(
          "Loaded YAML spec {} (modelView={}, {})",
          yamlPath,
          modelView,
          delta.isEmpty() ? "explicit layout" : "layout delta");
      // A spec that depends on who asks or in which language keeps its source tree, so it can be
      // re-derived per request (loadSpec(route, httpRequest)); everything else is shared as-is.
      var dependsOnRequest =
          io.mateu.core.application.security.YamlAccess.declaresAccess(root)
              || io.mateu.core.application.i18n.TranslationRegistry.mentionsI18n(root)
              || referencesRestrictedCatalogueAction(root);
      return new YamlPageSpec(
          modelView, layout, delta, actions, triggers, dependsOnRequest ? root : null, null, null);
    } catch (Exception e) {
      log.warn("Failed to parse YAML spec {}: {}", yamlPath, e.getMessage());
      return NONE;
    }
  }

  /**
   * The {@code actions:} a definition declares, or none.
   *
   * <p>What an action IS was never the thing missing from the DSL — a {@code Button} could already
   * name one, and an {@code Action} carrying a {@code restAction} already travels to the wire and
   * is run client-side. What was missing is a place for a page with NO view model to declare one,
   * since every other producer of actions reads them off a Java class. This is that place, and it
   * sits beside {@code layout:} because an action belongs to the screen, not to the route that
   * reaches it: two routes on the same definition should not have to repeat it.
   *
   * <p>Package-visible and static because an app shell definition ({@code type: AppShell}, read by
   * {@link YamlAppLoader}) declares its flows with exactly the same shape.
   */
  static java.util.List<io.mateu.uidl.fluent.Action> actionsOf(ObjectMapper mapper, JsonNode root) {
    var node = root == null ? null : root.get("actions");
    if (node == null || !node.isArray()) {
      return java.util.List.of();
    }
    var actions = new java.util.ArrayList<io.mateu.uidl.fluent.Action>();
    for (var item : node) {
      try {
        actions.add(mapper.treeToValue(item, io.mateu.uidl.fluent.Action.class));
      } catch (Exception e) {
        // One malformed action must not cost the page: the rest still render, and the id that did
        // not parse simply has nothing behind it — which the log says out loud.
        log.warn("Ignoring an unparseable action in a YAML spec: {}", e.getMessage());
      }
    }
    return java.util.List.copyOf(actions);
  }

  /**
   * The {@code triggers:} a definition declares, or none.
   *
   * <p>The mirror of {@link #actionsOf}: what a trigger IS was never missing from the DSL — a class
   * annotated {@code @Trigger}/{@code @SubscribeTo}/{@code @AutoSave} already reaches the wire, and
   * {@code TriggerMapper} already maps every {@code Trigger} record a {@code TriggersSupplier}
   * yields. What was missing is a place for a page with NO view model to declare one. This is that
   * place, and it sits beside {@code layout:}/{@code actions:} because a trigger belongs to the
   * screen: a definition serving two routes should not repeat it. The list is polymorphic — each
   * entry is discriminated by {@code type} ({@code OnLoadTrigger}, {@code OnCustomEventTrigger},
   * …), registered in {@link YamlUidlMapperFactory}.
   */
  private java.util.List<io.mateu.uidl.fluent.Trigger> triggersOf(JsonNode root) {
    var node = root == null ? null : root.get("triggers");
    if (node == null || !node.isArray()) {
      return java.util.List.of();
    }
    var triggers = new java.util.ArrayList<io.mateu.uidl.fluent.Trigger>();
    for (var item : node) {
      try {
        triggers.add(mapper.treeToValue(item, io.mateu.uidl.fluent.Trigger.class));
      } catch (Exception e) {
        // One malformed trigger must not cost the page: the rest still fire, and the one that did
        // not parse simply does nothing — which the log says out loud.
        log.warn("Ignoring an unparseable trigger in a YAML spec: {}", e.getMessage());
      }
    }
    return java.util.List.copyOf(triggers);
  }

  /**
   * Where a declared {@code definition} lives. Relative to {@code specs/ui/} — where the
   * definitions and the {@code routes.yaml} that routes to them sit together — unless it starts
   * with a slash, which addresses the classpath root.
   */
  private static String definitionPath(String definition) {
    return definition.startsWith("/") ? definition.substring(1) : "specs/ui/" + definition;
  }

  /**
   * The {@code layoutDelta:} of a page, or an empty one.
   *
   * <p>The alternative to {@code layout:}: instead of freezing what the screen looked like, it
   * records what a human decided about it — anchored to field ids, so inference keeps running and a
   * field the model grows later still appears.
   */
  private io.mateu.uidl.data.LayoutDelta deltaOf(JsonNode root) {
    var node = root == null ? null : root.get("layoutDelta");
    if (node == null || !node.isObject()) {
      return io.mateu.uidl.data.LayoutDelta.empty();
    }
    var order = new java.util.ArrayList<String>();
    if (node.has("order") && node.get("order").isArray()) {
      node.get("order").forEach(n -> order.add(n.asText()));
    }
    var hidden = new java.util.ArrayList<String>();
    if (node.has("hidden") && node.get("hidden").isArray()) {
      node.get("hidden").forEach(n -> hidden.add(n.asText()));
    }
    var overrides =
        new java.util.LinkedHashMap<String, io.mateu.uidl.data.LayoutDelta.FieldOverride>();
    if (node.has("overrides") && node.get("overrides").isObject()) {
      node.get("overrides")
          .fields()
          .forEachRemaining(
              entry -> {
                var value = entry.getValue();
                overrides.put(
                    entry.getKey(),
                    new io.mateu.uidl.data.LayoutDelta.FieldOverride(
                        value.hasNonNull("label") ? value.get("label").asText() : null,
                        value.hasNonNull("colspan") ? value.get("colspan").asInt() : null,
                        value.hasNonNull("section") ? value.get("section").asText() : null));
              });
    }
    return new io.mateu.uidl.data.LayoutDelta(order, hidden, overrides);
  }

  /**
   * The component tree of a parsed doc: the {@code layout:} node in an envelope, else the whole
   * doc.
   */
  private Component layoutOf(JsonNode root) throws Exception {
    if (root == null) {
      return null;
    }
    // A page that carries a `layoutDelta:` and no `layout:` has NO explicit layout on purpose —
    // that is the whole point of a delta. Falling back to "the whole document is the tree" here
    // would try to parse the delta itself as components and lose the page.
    if (!root.has("layout") && root.has("layoutDelta")) {
      return null;
    }
    var node = root.has("layout") ? root.get("layout") : root;
    return mapper.treeToValue(node, Component.class);
  }

  private InputStream resolve(String path) {
    var cl = Thread.currentThread().getContextClassLoader();
    var resource = cl != null ? cl.getResourceAsStream(path) : null;
    if (resource == null) {
      resource = YamlUidlLoader.class.getClassLoader().getResourceAsStream(path);
    }
    return resource;
  }

  private String normalize(String route) {
    var r = route == null ? "" : route;
    int idx = r.indexOf('?');
    if (idx >= 0) {
      r = r.substring(0, idx);
    }
    while (r.startsWith("/")) {
      r = r.substring(1);
    }
    return r;
  }
}
