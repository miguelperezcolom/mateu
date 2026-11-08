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
import java.lang.reflect.Modifier;
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
 * Write side of the access keys of the YAML pieces a Java view draws: the ids of the fields a YAML
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
 * <p>Which pieces a view draws is learned from its rendered trees ({@link #learn}). A view class
 * not rendered yet in this process that MAY draw pieces (a {@link ComponentTreeSupplier}, or a
 * class with a component-holder field) is checked against EVERY YAML piece of the app instead — a
 * POST straight after a restart, or a hand-made one, is still guarded. It fails CLOSED: when a
 * piece's access keys cannot be evaluated, all of its fields are treated as not writable.
 */
@Slf4j
public final class ClientLockedFields {

  private ClientLockedFields() {}

  enum Kind {
    PARTIAL,
    COMPONENT
  }

  record Ref(Kind kind, String name) {}

  private static final int MAX_DEPTH = 20;

  /** View type name → the pieces its rendered trees named (only ever grows: bounded by code). */
  private static final Map<String, Set<Ref>> LEARNED = new ConcurrentHashMap<>();

  /** Per specs index: whether any spec file declares access keys at all (the fast path). */
  private static final Map<SpecsIndex, Boolean> RESTRICTED =
      Collections.synchronizedMap(new WeakHashMap<>());

  /** (type, field) pairs already reported at WARN. */
  private static final Set<String> REPORTED = ConcurrentHashMap.newKeySet();

  /** Forget what was learned. Tests. */
  public static void reset() {
    LEARNED.clear();
    RESTRICTED.clear();
    REPORTED.clear();
  }

  /**
   * Records the YAML pieces {@code tree} (as returned by the view, before the partials are
   * expanded) names, for the view type {@code viewType}.
   */
  public static void learn(String viewType, Component tree) {
    if (viewType == null || tree == null) {
      return;
    }
    try {
      var refs = refsIn(tree);
      var known = LEARNED.computeIfAbsent(viewType, k -> ConcurrentHashMap.newKeySet());
      known.addAll(refs);
    } catch (Exception e) {
      log.debug("Could not learn the pieces of {}: {}", viewType, e.toString());
    }
  }

  /**
   * {@code state} without the entries the caller may not write into a {@code viewType}: the fields
   * of the YAML pieces the view draws that are hidden or locked for {@code httpRequest}. The very
   * same map when nothing is dropped.
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
    var locked = lockedFor(viewType, httpRequest, drawsPieces);
    return without(viewType.getName(), state, locked);
  }

  /**
   * {@code state} without the entries {@code locked} names, one log line per (owner, key): WARN the
   * first time, DEBUG after.
   */
  public static Map<String, Object> without(
      String owner, Map<String, Object> state, Set<String> locked) {
    if (state == null || locked == null || locked.isEmpty()) {
      return state;
    }
    Map<String, Object> narrowed = null;
    for (var key : state.keySet()) {
      if (locked.contains(key)) {
        if (narrowed == null) {
          narrowed = new LinkedHashMap<>(state);
        }
        narrowed.remove(key);
        if (REPORTED.add(owner + "#" + key)) {
          log.warn(
              "Dropped client state for '{}' of {}: a YAML partial/component it draws hides or locks"
                  + " that field for the caller (further drops are logged at DEBUG)",
              key,
              owner);
        } else {
          log.debug("Dropped client state for locked field '{}' of {}", key, owner);
        }
      }
    }
    return narrowed == null ? state : narrowed;
  }

  /** The field ids the caller may not write into a {@code viewType}. */
  public static Set<String> lockedFor(Class<?> viewType, HttpRequest httpRequest) {
    return lockedFor(viewType, httpRequest, false);
  }

  private static Set<String> lockedFor(
      Class<?> viewType, HttpRequest httpRequest, boolean drawsPieces) {
    if (viewType == null || !anyRestrictedSpec()) {
      return Set.of();
    }
    var learned = LEARNED.get(viewType.getName());
    try {
      if (learned != null && !learned.isEmpty()) {
        return lockedBy(learned, httpRequest);
      }
      if (learned == null && (drawsPieces || mayDrawPieces(viewType))) {
        return lockedBy(everyPiece(), httpRequest);
      }
      return Set.of();
    } catch (RuntimeException e) {
      log.error(
          "Could not derive the locked fields of {}; treating every field of every YAML piece as"
              + " not writable",
          viewType.getName(),
          e);
      return everyFieldOfEveryPiece(httpRequest);
    }
  }

  /** The field ids the YAML pieces {@code tree} names hide or lock for the caller. */
  public static Set<String> lockedByPiecesOf(Component tree, HttpRequest httpRequest) {
    if (tree == null || !anyRestrictedSpec()) {
      return Set.of();
    }
    try {
      return lockedBy(refsIn(tree), httpRequest);
    } catch (RuntimeException e) {
      log.error("Could not derive the locked fields of a tree's pieces; treating all as locked", e);
      return everyFieldOfEveryPiece(httpRequest);
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

  /** A view that may draw a partial: a component tree, or a class holding components. */
  private static boolean mayDrawPieces(Class<?> type) {
    if (ComponentTreeSupplier.class.isAssignableFrom(type)
        || Component.class.isAssignableFrom(type)) {
      return true;
    }
    for (var field : AllFieldsProvider.getAllFields(type)) {
      if (!Modifier.isStatic(field.getModifiers()) && HolderFieldChecker.isNonDataHolder(field)) {
        return true;
      }
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

  private static Set<String> everyFieldOfEveryPiece(HttpRequest httpRequest) {
    var out = new LinkedHashSet<String>();
    try {
      for (var ref : everyPiece()) {
        lockAll(ref, httpRequest, new ArrayDeque<>(), out);
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

  private static Set<String> lockedBy(Set<Ref> refs, HttpRequest httpRequest) {
    var out = new LinkedHashSet<String>();
    for (var ref : refs) {
      locked(ref, httpRequest, new ArrayDeque<>(), out);
    }
    return out;
  }

  /** The fields {@code ref} hides or locks for the caller, its nested pieces included. */
  private static void locked(Ref ref, HttpRequest rq, Deque<Ref> chain, Set<String> out) {
    if (chain.contains(ref) || chain.size() >= MAX_DEPTH) {
      return;
    }
    chain.push(ref);
    try {
      var source = sourceOf(ref, rq);
      if (source instanceof JsonNode node) {
        lockedBySource(ref, node, rq, chain, out);
      } else if (source instanceof Collection<?> code) {
        for (var item : code) {
          for (var nested : refsIn(item)) {
            locked(nested, rq, chain, out);
          }
        }
      }
    } finally {
      chain.pop();
    }
  }

  private static void lockedBySource(
      Ref ref, JsonNode source, HttpRequest rq, Deque<Ref> chain, Set<String> out) {
    var nested = refsIn(source);
    Set<Ref> visible;
    try {
      if (YamlAccess.declaresAccess(source)) {
        var applied = YamlAccess.apply(source, rq, null);
        out.addAll(applied.lockedFields());
        visible = applied.tree() == null ? Set.of() : refsIn(applied.tree());
        if (applied.tree() == null) {
          out.addAll(fieldIdsIn(source)); // the whole piece is hidden from the caller
        }
      } else {
        visible = nested;
      }
    } catch (Exception e) {
      log.error(
          "Could not apply the access keys of {} '{}'; none of its fields is writable",
          ref.kind().name().toLowerCase(),
          ref.name(),
          e);
      out.addAll(fieldIdsIn(source));
      visible = Set.of();
    }
    for (var child : nested) {
      if (visible.contains(child)) {
        locked(child, rq, chain, out);
      } else {
        lockAll(child, rq, chain, out); // under a section the caller may not see
      }
    }
  }

  /** Every field of {@code ref}, its nested pieces included: none of it reaches the caller. */
  private static void lockAll(Ref ref, HttpRequest rq, Deque<Ref> chain, Set<String> out) {
    if (chain.contains(ref) || chain.size() >= MAX_DEPTH) {
      return;
    }
    chain.push(ref);
    try {
      var source = sourceOf(ref, rq);
      if (source instanceof JsonNode node) {
        out.addAll(fieldIdsIn(node));
        for (var child : refsIn(node)) {
          lockAll(child, rq, chain, out);
        }
      } else if (source instanceof Collection<?> code) {
        for (var item : code) {
          collectFieldIds(item, out, new IdentityHashMap<>(), 0);
          for (var child : refsIn(item)) {
            lockAll(child, rq, chain, out);
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
