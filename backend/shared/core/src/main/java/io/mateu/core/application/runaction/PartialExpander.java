package io.mateu.core.application.runaction;

import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Constructor;
import java.lang.reflect.RecordComponent;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Deque;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Inlines every {@link Partial} in a component tree, before anything maps it to DTOs.
 *
 * <p>This is what makes a partial "usable anywhere a component is" true rather than aspirational.
 * The alternative — a partial node on the wire that each renderer resolves — would mean the feature
 * ships once per renderer, arrives late in the ones nobody maintains, and leaves a static bundle
 * holding a reference it cannot follow. Resolving here means the wire never learns the concept
 * exists, and neither does any renderer.
 *
 * <p>A partial that stands for <b>several</b> components is spliced into its parent's content
 * rather than wrapped, so putting one inside a {@code FormLayout} yields form fields — not a nested
 * layout that quietly breaks the grid. That splice is why this walks the tree generically over
 * record components instead of teaching each of the ~36 layout mappers about partials: the rule
 * belongs in one place, and a layout added next year gets it for free.
 *
 * <p>In the one position where splicing is impossible — a slot that holds a single component, like
 * {@code Container.content} — a multi-component partial is stacked in a bare {@link
 * VerticalLayout}. Nothing else is available there, and silently dropping all but the first would
 * be worse.
 */
@Slf4j
public final class PartialExpander {

  /** A ref chain longer than this is a bug, not a design. Belt to the cycle detector's braces. */
  private static final int MAX_DEPTH = 20;

  private static final ConcurrentHashMap<Class<?>, Shape> SHAPES = new ConcurrentHashMap<>();

  /**
   * What a component record looks like to this walker, worked out once per class.
   *
   * @param all every record component, in canonical-constructor order
   * @param walkable the indices worth descending into. Everything else — labels, ids, enums,
   *     numbers — is skipped by static type, so a page of text costs a handful of index lookups
   *     rather than a reflective read per field.
   * @param canonical the constructor used to rebuild the record once a child has changed
   */
  private record Shape(RecordComponent[] all, int[] walkable, Constructor<?> canonical) {}

  private PartialExpander() {}

  /**
   * The tree with its partials resolved. Returns the very same instance when there was nothing to
   * resolve, which is the common case and costs one reflective pass with no allocation.
   */
  public static Component expand(Component root, HttpRequest httpRequest) {
    if (root == null) {
      return null;
    }
    try {
      return single(root, httpRequest, new ArrayDeque<>());
    } catch (Exception e) {
      // A tree that renders slightly wrong beats a page that does not render. The refs that failed
      // have already been logged by the registry.
      log.error("Could not expand partials; rendering the tree as authored", e);
      return root;
    }
  }

  /** What a component becomes in a slot that holds exactly one. */
  private static Component single(Component component, HttpRequest request, Deque<String> chain) {
    var expanded = inList(component, request, chain);
    if (expanded.isEmpty()) {
      return null;
    }
    if (expanded.size() == 1) {
      return expanded.get(0);
    }
    return new VerticalLayout(expanded);
  }

  /** What a component becomes in a content list — where a partial may contribute several. */
  private static List<Component> inList(
      Component component, HttpRequest request, Deque<String> chain) {
    if (!(component instanceof Partial partial)) {
      return List.of(rewrite(component, request, chain));
    }
    var ref = partial.ref();
    if (chain.contains(ref)) {
      // A stack iterates newest-first; reversed, the message reads as the include chain a human
      // would follow through the files.
      var path = new ArrayList<>(chain);
      java.util.Collections.reverse(path);
      path.add(ref);
      log.error("Partial '{}' includes itself: {}", ref, String.join(" -> ", path));
      return List.of();
    }
    if (chain.size() >= MAX_DEPTH) {
      log.error("Partial nesting deeper than {} at '{}'; stopping", MAX_DEPTH, ref);
      return List.of();
    }
    chain.push(ref);
    try {
      var resolved = new ArrayList<Component>();
      for (var child : PartialRegistry.instance().resolve(ref, request)) {
        resolved.addAll(inList(child, request, chain));
      }
      return resolved;
    } finally {
      chain.pop();
    }
  }

  /** The same component with its children expanded — identical instance when nothing changed. */
  private static Component rewrite(Component component, HttpRequest request, Deque<String> chain) {
    if (component == null || !component.getClass().isRecord()) {
      return component;
    }
    var shape = shapeOf(component.getClass());
    if (shape == null || shape.walkable().length == 0) {
      return component;
    }
    Object[] values = null;
    for (var index : shape.walkable()) {
      Object current;
      try {
        current = shape.all()[index].getAccessor().invoke(component);
      } catch (Exception e) {
        log.debug(
            "Could not read {}.{}",
            component.getClass().getSimpleName(),
            shape.all()[index].getName(),
            e);
        continue;
      }
      var rewritten = rewriteValue(current, request, chain);
      if (rewritten == current) {
        continue;
      }
      if (values == null) {
        values = read(component, shape.all());
        if (values == null) {
          return component;
        }
      }
      values[index] = rewritten;
    }
    if (values == null) {
      return component;
    }
    try {
      return (Component) shape.canonical().newInstance(values);
    } catch (Exception e) {
      log.error("Could not rebuild {} with its partials inlined", component.getClass(), e);
      return component;
    }
  }

  private static Object rewriteValue(Object value, HttpRequest request, Deque<String> chain) {
    if (value instanceof Component child) {
      var expanded = single(child, request, chain);
      return expanded == child ? value : expanded;
    }
    if (value instanceof Collection<?> collection) {
      if (collection.isEmpty() || !(collection.iterator().next() instanceof Component)) {
        // Options, grid columns, flex grows — plenty of lists on a component hold no components.
        return value;
      }
      var changed = false;
      var rewritten = new ArrayList<Object>(collection.size());
      for (var element : collection) {
        if (!(element instanceof Component child)) {
          rewritten.add(element);
          continue;
        }
        var expanded = inList(child, request, chain);
        changed |= expanded.size() != 1 || expanded.get(0) != child;
        rewritten.addAll(expanded);
      }
      return changed ? List.copyOf(rewritten) : value;
    }
    return value;
  }

  /** Null when the record has no canonical constructor we can reach — then we leave it alone. */
  private static Shape shapeOf(Class<?> type) {
    return SHAPES.computeIfAbsent(
        type,
        t -> {
          var all = t.getRecordComponents();
          var walkable = new ArrayList<Integer>();
          var types = new Class<?>[all.length];
          for (var i = 0; i < all.length; i++) {
            types[i] = all[i].getType();
            if (Component.class.isAssignableFrom(types[i])
                || Collection.class.isAssignableFrom(types[i])) {
              walkable.add(i);
            }
          }
          try {
            var canonical = t.getDeclaredConstructor(types);
            canonical.setAccessible(true);
            var indices = new int[walkable.size()];
            for (var i = 0; i < indices.length; i++) {
              indices[i] = walkable.get(i);
            }
            return new Shape(all, indices, canonical);
          } catch (Exception e) {
            log.error("No reachable canonical constructor on {}", t, e);
            return new Shape(all, new int[0], null);
          }
        });
  }

  private static Object[] read(Component component, RecordComponent[] all) {
    var values = new Object[all.length];
    for (var i = 0; i < all.length; i++) {
      try {
        values[i] = all[i].getAccessor().invoke(component);
      } catch (Exception e) {
        log.error("Could not read {}.{}", component.getClass(), all[i].getName(), e);
        return null;
      }
    }
    return values;
  }
}
