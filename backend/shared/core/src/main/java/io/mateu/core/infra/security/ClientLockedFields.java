package io.mateu.core.infra.security;

import com.fasterxml.jackson.databind.JsonNode;
import io.mateu.core.application.runaction.ComponentRegistry;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.core.application.runaction.SpecsIndex;
import io.mateu.core.application.security.YamlAccess;
import io.mateu.core.infra.reflection.read.AllFieldsProvider;
import io.mateu.core.infra.reflection.read.HolderFieldChecker;
import io.mateu.uidl.data.ComponentRef;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.GenericArrayType;
import java.lang.reflect.Modifier;
import java.lang.reflect.ParameterizedType;
import java.lang.reflect.Type;
import java.lang.reflect.WildcardType;
import java.util.ArrayDeque;
import java.util.Collection;
import java.util.Collections;
import java.util.Deque;
import java.util.IdentityHashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.WeakHashMap;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Write side of the access keys of the YAML pieces a view may draw: the ids of the fields a YAML
 * partial ({@code new Partial("payroll")}) or a {@code components.yaml} business component ({@code
 * new ComponentRef("Payroll")}) hides ({@code eyesOnly:}) or locks ({@code readOnlyUnless:}, {@code
 * disabledUnless:}) for THIS caller, so the state the client posts for them is dropped before it
 * reaches the view model.
 *
 * <p>The read side ({@link PartialRegistry}, {@link ComponentRegistry}) applies those keys while
 * the tree is MAPPED — after the view was created and hydrated — so the hydration could not know
 * the pieces' fields and a tampered state wrote them. This derives them up front, from the pieces'
 * DEFINITIONS (no rendering): {@link YamlAccess#apply} reports the fields it locks, the pieces a
 * definition nests are followed, and a piece hidden from the caller locks every field under it.
 *
 * <p>The rule is STRICT: a view that may draw pieces (a {@link ComponentTreeSupplier}, a {@link
 * Component}, a class with a component-holder field or a method returning components, an adapted
 * model, a YAML layout) is ALWAYS checked against EVERY partial and business component of the app.
 * What a view drew in earlier renders is never the source of truth, because a page may draw a piece
 * only in some state. The price is a documented false positive: a posted field whose name matches a
 * field some unrelated piece locks for this caller is dropped too — the WARN names the piece, so
 * the author can rename one of them. The app-wide set is cached per caller identity (roles, groups,
 * scopes, permissions) and dropped when the specs change. It costs nothing when no spec file
 * declares access keys, and it fails CLOSED: when a piece's access keys cannot be evaluated, all of
 * its fields are treated as not writable.
 */
@Slf4j
public final class ClientLockedFields {

  private ClientLockedFields() {}

  enum Kind {
    PARTIAL,
    COMPONENT
  }

  record Ref(Kind kind, String name) {
    String label() {
      return (kind == Kind.PARTIAL ? "partial '" : "business component '") + name + "'";
    }
  }

  /** The caller as far as access keys can tell (its name does not matter to them). */
  private record IdentityKey(
      Set<String> roles, Set<String> groups, Set<String> scopes, Set<String> permissions) {
    static IdentityKey of(HttpRequest httpRequest) {
      var identity = IdentityResolver.resolve(httpRequest);
      return new IdentityKey(
          Set.copyOf(identity.roles()),
          Set.copyOf(identity.groups()),
          Set.copyOf(identity.scopes()),
          Set.copyOf(identity.permissions()));
    }
  }

  private static final int MAX_DEPTH = 20;

  private static final int MAX_CACHED_IDENTITIES = 512;

  /**
   * Caller identity → field id → the piece that locks it, app-wide. Only ever a cache, filled from
   * the pieces' definitions (never from what was rendered); not filled when a piece is built in
   * code, whose content may depend on the request.
   */
  private static final Map<IdentityKey, Map<String, String>> APP_WIDE = new ConcurrentHashMap<>();

  /** Per specs index: whether any spec file declares access keys at all (the fast path). */
  private static final Map<SpecsIndex, Boolean> RESTRICTED =
      Collections.synchronizedMap(new WeakHashMap<>());

  /** Whether a view class may draw pieces (decided once per class). */
  private static final ClassValue<Boolean> MAY_DRAW =
      new ClassValue<>() {
        @Override
        protected Boolean computeValue(Class<?> type) {
          return computeMayDrawPieces(type);
        }
      };

  /** (type, field) pairs already reported at WARN. */
  private static final Set<String> REPORTED = ConcurrentHashMap.newKeySet();

  /** Drops the caches when a spec file changes (dev mode); a static field keeps it registered. */
  private static final io.mateu.core.infra.dev.SpecsCache ON_SPECS_CHANGED =
      () -> {
        APP_WIDE.clear();
        RESTRICTED.clear();
      };

  static {
    io.mateu.core.infra.dev.DevSpecs.register(ON_SPECS_CHANGED);
  }

  /** Forget what was cached. Tests. */
  public static void reset() {
    APP_WIDE.clear();
    RESTRICTED.clear();
    REPORTED.clear();
  }

  /**
   * {@code state} without the entries the caller may not write into a {@code viewType}: when the
   * view may draw YAML pieces, the fields that ANY partial or business component of the app hides
   * or locks for {@code httpRequest}. The very same map when nothing is dropped.
   */
  public static Map<String, Object> withoutLocked(
      Class<?> viewType, Map<String, Object> state, HttpRequest httpRequest) {
    return withoutLocked(viewType, state, httpRequest, false);
  }

  /**
   * As {@link #withoutLocked(Class, Map, HttpRequest)}; {@code drawsPieces} says the view may draw
   * YAML pieces whatever its shape (an adapted model: its adapter builds the tree).
   */
  public static Map<String, Object> withoutLocked(
      Class<?> viewType, Map<String, Object> state, HttpRequest httpRequest, boolean drawsPieces) {
    if (state == null || state.isEmpty() || viewType == null) {
      return state;
    }
    if (!drawsPieces && !mayDrawPieces(viewType)) {
      return state;
    }
    return without(viewType.getName(), state, appWideLockedFor(httpRequest));
  }

  /**
   * {@code state} without the entries {@code locked} names, one log line per (owner, key): WARN the
   * first time, DEBUG after.
   */
  public static Map<String, Object> without(
      String owner, Map<String, Object> state, Set<String> locked) {
    if (locked == null || locked.isEmpty()) {
      return state;
    }
    var by = new LinkedHashMap<String, String>();
    locked.forEach(key -> by.put(key, null));
    return without(owner, state, by);
  }

  /**
   * {@code state} without the keys of {@code lockedBy} (field id → the piece that locks it), one
   * log line per (owner, key): WARN the first time, naming the piece, DEBUG after.
   */
  public static Map<String, Object> without(
      String owner, Map<String, Object> state, Map<String, String> lockedBy) {
    if (state == null || lockedBy == null || lockedBy.isEmpty()) {
      return state;
    }
    Map<String, Object> narrowed = null;
    for (var key : state.keySet()) {
      if (!lockedBy.containsKey(key)) {
        continue;
      }
      if (narrowed == null) {
        narrowed = new LinkedHashMap<>(state);
      }
      narrowed.remove(key);
      var piece = lockedBy.get(key) == null ? "a YAML partial/component" : lockedBy.get(key);
      if (REPORTED.add(owner + "#" + key)) {
        log.warn(
            "Dropped client state for '{}' of {}: {} hides or locks a field of that name for the"
                + " caller. Every view that may draw YAML pieces is checked against every partial"
                + " and business component of the app; if that piece is unrelated to this view,"
                + " rename one of the two fields (further drops are logged at DEBUG)",
            key,
            owner,
            piece);
      } else {
        log.debug("Dropped client state for locked field '{}' of {} ({})", key, owner, piece);
      }
    }
    return narrowed == null ? state : narrowed;
  }

  /** The field ids the caller may not write into a {@code viewType}. */
  public static Set<String> lockedFor(Class<?> viewType, HttpRequest httpRequest) {
    if (viewType == null || !mayDrawPieces(viewType)) {
      return Set.of();
    }
    return appWideLockedFor(httpRequest).keySet();
  }

  /**
   * Field id → the piece that locks it: every field that ANY YAML partial or business component of
   * the app hides or locks for the caller. Empty (and free) when no spec file declares access keys.
   */
  public static Map<String, String> appWideLockedFor(HttpRequest httpRequest) {
    if (!anyRestrictedSpec()) {
      return Map.of();
    }
    IdentityKey key;
    try {
      key = IdentityKey.of(httpRequest);
    } catch (RuntimeException e) {
      key = null; // not cacheable: evaluated for this request alone
    }
    if (key != null) {
      var cached = APP_WIDE.get(key);
      if (cached != null) {
        return cached;
      }
    }
    var fromCode = new boolean[1];
    Map<String, String> locked;
    try {
      locked = Collections.unmodifiableMap(lockedBy(everyPiece(), httpRequest, fromCode));
    } catch (RuntimeException e) {
      log.error(
          "Could not derive the locked fields of the app's YAML pieces; treating every field of"
              + " every piece as not writable",
          e);
      return everyFieldOfEveryPiece(httpRequest);
    }
    if (key != null && !fromCode[0]) {
      if (APP_WIDE.size() >= MAX_CACHED_IDENTITIES) {
        APP_WIDE.clear();
      }
      APP_WIDE.put(key, locked);
    }
    return locked;
  }

  /** The field ids the YAML pieces {@code tree} names hide or lock for the caller. */
  public static Set<String> lockedByPiecesOf(Component tree, HttpRequest httpRequest) {
    if (tree == null || !anyRestrictedSpec()) {
      return Set.of();
    }
    try {
      return lockedBy(refsIn(tree), httpRequest, new boolean[1]).keySet();
    } catch (RuntimeException e) {
      log.error("Could not derive the locked fields of a tree's pieces; treating all as locked", e);
      return everyFieldOfEveryPiece(httpRequest).keySet();
    }
  }

  // ── the pieces ──────────────────────────────────────────────────────────────────────────────

  private static ClassLoader specsClassLoader() {
    return io.mateu.core.infra.dev.DevSpecs.classLoader(
        Thread.currentThread().getContextClassLoader());
  }

  /** Whether any spec file declares access keys: without one, no piece can lock anything. */
  private static boolean anyRestrictedSpec() {
    try {
      var index = SpecsIndex.of(specsClassLoader());
      return RESTRICTED.computeIfAbsent(
          index,
          i -> {
            for (var path : i.paths()) {
              try {
                var tree = i.tree(path);
                if (tree != null && YamlAccess.declaresAccess(tree)) {
                  return true;
                }
              } catch (Exception e) {
                return true; // a file we cannot read might well restrict something
              }
            }
            return false;
          });
    } catch (RuntimeException e) {
      return true;
    }
  }

  /** Whether {@code type} may draw a partial. Decided once per class. */
  static boolean mayDrawPieces(Class<?> type) {
    return MAY_DRAW.get(type);
  }

  /**
   * A view that may draw a partial: a component tree, a component, a class holding components, or
   * one with a method returning components (an archetype's {@code overview(row)}, a header
   * supplier…).
   */
  private static boolean computeMayDrawPieces(Class<?> type) {
    if (ComponentTreeSupplier.class.isAssignableFrom(type)
        || Component.class.isAssignableFrom(type)) {
      return true;
    }
    try {
      for (var field : AllFieldsProvider.getAllFields(type)) {
        if (!Modifier.isStatic(field.getModifiers()) && HolderFieldChecker.isNonDataHolder(field)) {
          return true;
        }
      }
      for (var c = type; c != null && c != Object.class; c = c.getSuperclass()) {
        for (var method : c.getDeclaredMethods()) {
          if (!Modifier.isStatic(method.getModifiers())
              && mentionsComponent(method.getGenericReturnType(), 0)) {
            return true;
          }
        }
      }
      for (var method : type.getMethods()) {
        if (mentionsComponent(method.getGenericReturnType(), 0)) {
          return true;
        }
      }
    } catch (RuntimeException | LinkageError e) {
      return true; // fail closed: a class we cannot inspect is checked
    }
    return false;
  }

  /** Whether a (generic) type is, or carries, a {@link Component}. */
  private static boolean mentionsComponent(Type type, int depth) {
    if (type == null || depth > 4) {
      return false;
    }
    if (type instanceof Class<?> c) {
      return Component.class.isAssignableFrom(c)
          || (c.isArray() && mentionsComponent(c.getComponentType(), depth + 1));
    }
    if (type instanceof ParameterizedType p) {
      if (mentionsComponent(p.getRawType(), depth + 1)) {
        return true;
      }
      for (var arg : p.getActualTypeArguments()) {
        if (mentionsComponent(arg, depth + 1)) {
          return true;
        }
      }
      return false;
    }
    if (type instanceof WildcardType w) {
      for (var bound : w.getUpperBounds()) {
        if (mentionsComponent(bound, depth + 1)) {
          return true;
        }
      }
      return false;
    }
    if (type instanceof GenericArrayType a) {
      return mentionsComponent(a.getGenericComponentType(), depth + 1);
    }
    return false;
  }

  /** Every YAML partial file and every business component of the app. */
  private static Set<Ref> everyPiece() {
    var all = new LinkedHashSet<Ref>();
    for (var path : SpecsIndex.of(specsClassLoader()).paths()) {
      if (path.startsWith("specs/ui/partials/")) {
        all.add(new Ref(Kind.PARTIAL, path));
      }
    }
    var components = components();
    if (components != null) {
      for (var entry : components.catalog().components()) {
        all.add(new Ref(Kind.COMPONENT, entry.name()));
      }
    }
    return all;
  }

  private static Map<String, String> everyFieldOfEveryPiece(HttpRequest httpRequest) {
    var out = new LinkedHashMap<String, String>();
    try {
      for (var ref : everyPiece()) {
        lockAll(ref, httpRequest, new ArrayDeque<>(), out, new boolean[1]);
      }
    } catch (RuntimeException e) {
      throw new IllegalStateException("the locked fields of the app's YAML pieces are unknown", e);
    }
    return out;
  }

  private static ComponentRegistry components() {
    try {
      return MateuBeanProvider.getSingletonBean(ComponentRegistry.class);
    } catch (Throwable t) {
      return null;
    }
  }

  // ── what a piece locks ──────────────────────────────────────────────────────────────────────

  private static Map<String, String> lockedBy(
      Set<Ref> refs, HttpRequest httpRequest, boolean[] fromCode) {
    var out = new LinkedHashMap<String, String>();
    for (var ref : refs) {
      locked(ref, httpRequest, new ArrayDeque<>(), out, fromCode);
    }
    return out;
  }

  private static void lock(Map<String, String> out, Collection<String> fields, Ref by) {
    for (var field : fields) {
      out.putIfAbsent(field, by.label());
    }
  }

  /** The fields {@code ref} hides or locks for the caller, its nested pieces included. */
  private static void locked(
      Ref ref, HttpRequest rq, Deque<Ref> chain, Map<String, String> out, boolean[] fromCode) {
    if (chain.contains(ref) || chain.size() >= MAX_DEPTH) {
      return;
    }
    chain.push(ref);
    try {
      var source = sourceOf(ref, rq);
      if (source instanceof JsonNode node) {
        lockedBySource(ref, node, rq, chain, out, fromCode);
      } else if (source instanceof Collection<?> code) {
        fromCode[0] = true;
        for (var item : code) {
          for (var nested : refsIn(item)) {
            locked(nested, rq, chain, out, fromCode);
          }
        }
      }
    } finally {
      chain.pop();
    }
  }

  private static void lockedBySource(
      Ref ref,
      JsonNode source,
      HttpRequest rq,
      Deque<Ref> chain,
      Map<String, String> out,
      boolean[] fromCode) {
    var nested = refsIn(source);
    Set<Ref> visible;
    try {
      if (YamlAccess.declaresAccess(source)) {
        var applied = YamlAccess.apply(source, rq, null);
        lock(out, applied.lockedFields(), ref);
        visible = applied.tree() == null ? Set.of() : refsIn(applied.tree());
        if (applied.tree() == null) {
          lock(out, fieldIdsIn(source), ref); // the whole piece is hidden from the caller
        }
      } else {
        visible = nested;
      }
    } catch (Exception e) {
      log.error(
          "Could not apply the access keys of {}; none of its fields is writable", ref.label(), e);
      lock(out, fieldIdsIn(source), ref);
      visible = Set.of();
    }
    for (var child : nested) {
      if (visible.contains(child)) {
        locked(child, rq, chain, out, fromCode);
      } else {
        lockAll(child, rq, chain, out, fromCode); // under a section the caller may not see
      }
    }
  }

  /** Every field of {@code ref}, its nested pieces included: none of it reaches the caller. */
  private static void lockAll(
      Ref ref, HttpRequest rq, Deque<Ref> chain, Map<String, String> out, boolean[] fromCode) {
    if (chain.contains(ref) || chain.size() >= MAX_DEPTH) {
      return;
    }
    chain.push(ref);
    try {
      var source = sourceOf(ref, rq);
      if (source instanceof JsonNode node) {
        lock(out, fieldIdsIn(node), ref);
        for (var child : refsIn(node)) {
          lockAll(child, rq, chain, out, fromCode);
        }
      } else if (source instanceof Collection<?> code) {
        fromCode[0] = true;
        for (var item : code) {
          var ids = new LinkedHashSet<String>();
          collectFieldIds(item, ids, new IdentityHashMap<>(), 0);
          lock(out, ids, ref);
          for (var child : refsIn(item)) {
            lockAll(child, rq, chain, out, fromCode);
          }
        }
      }
    } finally {
      chain.pop();
    }
  }

  /**
   * The definition of a piece: a YAML source tree ({@link JsonNode}), components built in code (a
   * {@link Collection}), or {@code null} when it resolves to nothing.
   */
  private static Object sourceOf(Ref ref, HttpRequest rq) {
    if (ref.kind() == Kind.PARTIAL) {
      var registry = PartialRegistry.instance();
      var code = registry.codeComponentsOf(ref.name(), rq);
      if (code != null) {
        return code;
      }
      return registry.sourceOf(ref.name());
    }
    var components = components();
    if (components == null) {
      throw new IllegalStateException("no component catalogue to resolve '" + ref.name() + "'");
    }
    var authored = components.authoredSourceOf(ref.name());
    if (authored != null) {
      return authored;
    }
    return components
        .get(ref.name())
        .map(e -> (Object) java.util.List.of(e.component()))
        .orElse(null);
  }

  // ── walks ───────────────────────────────────────────────────────────────────────────────────

  /** The pieces a YAML tree names ({@code type: Partial} / {@code type: ComponentRef}). */
  static Set<Ref> refsIn(JsonNode node) {
    var out = new LinkedHashSet<Ref>();
    collectRefs(node, out);
    return out;
  }

  private static void collectRefs(JsonNode node, Set<Ref> out) {
    if (node == null) {
      return;
    }
    if (node.isObject()) {
      var type = node.path("type").asText("");
      var ref = node.path("ref").asText("");
      if (!ref.isBlank() && "Partial".equals(type)) {
        out.add(new Ref(Kind.PARTIAL, ref));
      } else if (!ref.isBlank() && "ComponentRef".equals(type)) {
        out.add(new Ref(Kind.COMPONENT, ref));
      }
    }
    if (node.isContainerNode()) {
      node.elements().forEachRemaining(child -> collectRefs(child, out));
    }
  }

  /** The ids of every {@code FormField} in a YAML tree. */
  static Set<String> fieldIdsIn(JsonNode node) {
    var out = new LinkedHashSet<String>();
    collectFieldIds(node, out);
    return out;
  }

  private static void collectFieldIds(JsonNode node, Set<String> out) {
    if (node == null) {
      return;
    }
    if (node.isObject()
        && "FormField".equals(node.path("type").asText())
        && node.hasNonNull("id")) {
      out.add(node.get("id").asText());
    }
    if (node.isContainerNode()) {
      node.elements().forEachRemaining(child -> collectFieldIds(child, out));
    }
  }

  /** The pieces a component tree built in code names. */
  static Set<Ref> refsIn(Object tree) {
    var out = new LinkedHashSet<Ref>();
    walk(tree, out, null, new IdentityHashMap<>(), 0);
    return out;
  }

  private static void collectFieldIds(
      Object value, Set<String> out, IdentityHashMap<Object, Boolean> seen, int depth) {
    walk(value, null, out, seen, depth);
  }

  private static void walk(
      Object value,
      Set<Ref> refs,
      Set<String> fieldIds,
      IdentityHashMap<Object, Boolean> seen,
      int depth) {
    if (value == null || depth > 64 || seen.put(value, Boolean.TRUE) != null) {
      return;
    }
    if (value instanceof Partial partial) {
      if (refs != null && partial.ref() != null && !partial.ref().isBlank()) {
        refs.add(new Ref(Kind.PARTIAL, partial.ref()));
      }
      return;
    }
    if (value instanceof ComponentRef componentRef) {
      if (refs != null && componentRef.ref() != null && !componentRef.ref().isBlank()) {
        refs.add(new Ref(Kind.COMPONENT, componentRef.ref()));
      }
      return;
    }
    if (value instanceof FormField field && fieldIds != null && field.id() != null) {
      fieldIds.add(field.id());
    }
    if (value instanceof Collection<?> collection) {
      for (var item : collection) {
        walk(item, refs, fieldIds, seen, depth + 1);
      }
      return;
    }
    if (value instanceof Map<?, ?> map) {
      for (var item : map.values()) {
        walk(item, refs, fieldIds, seen, depth + 1);
      }
      return;
    }
    if (!value.getClass().isRecord()) {
      return;
    }
    for (var component : value.getClass().getRecordComponents()) {
      try {
        var child = component.getAccessor().invoke(value);
        if (child == null
            || child instanceof String
            || child instanceof Number
            || child instanceof Boolean
            || child instanceof Enum<?>) {
          continue;
        }
        walk(child, refs, fieldIds, seen, depth + 1);
      } catch (ReflectiveOperationException | RuntimeException e) {
        // an accessor we cannot call names no piece we could find
      }
    }
  }
}
