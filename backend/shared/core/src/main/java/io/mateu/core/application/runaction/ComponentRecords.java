package io.mateu.core.application.runaction;

import io.mateu.uidl.fluent.Component;
import java.lang.reflect.Constructor;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;

/**
 * Generic rewriting of a component tree, worked out once per component class.
 *
 * <p>Every component in {@code io.mateu.uidl.data} is a record, which is what makes this possible:
 * a tree can be rewritten without a mapper per component type. Two features need exactly that —
 * inlining partials, and applying a layout delta — and both would otherwise have to be taught to
 * each of the ~36 layout mappers separately. Here the rule lives once, and a layout added next year
 * inherits it.
 *
 * <p>The contract callers rely on: a rewrite that changes nothing returns the <b>same instance</b>,
 * so the common case costs one reflective pass and no allocation.
 */
@Slf4j
public final class ComponentRecords {

  private static final ConcurrentHashMap<Class<?>, Shape> SHAPES = new ConcurrentHashMap<>();

  private ComponentRecords() {}

  /**
   * What a component record looks like to a walker.
   *
   * @param all every record component, in canonical-constructor order
   * @param walkable the indices worth descending into. Everything else — labels, ids, enums,
   *     numbers — is skipped by static type, so a page of text costs a handful of index lookups
   *     rather than a reflective read per field.
   * @param canonical the constructor used to rebuild once a child has changed; null when it cannot
   *     be reached, in which case the component is left alone
   */
  public record Shape(RecordComponent[] all, int[] walkable, Constructor<?> canonical) {}

  public static Shape shapeOf(Class<?> type) {
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

  /** How a walker turns one record-component value into its replacement. */
  @FunctionalInterface
  public interface ValueRewriter {
    /** Return the value unchanged (same reference) when there is nothing to do. */
    Object rewrite(Object value);
  }

  /**
   * The same component with its walkable values passed through {@code rewriter} — and the identical
   * instance when every one of them came back unchanged.
   */
  public static Component rewrite(Component component, ValueRewriter rewriter) {
    if (component == null || !component.getClass().isRecord()) {
      return component;
    }
    var shape = shapeOf(component.getClass());
    if (shape.walkable().length == 0 || shape.canonical() == null) {
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
      var rewritten = rewriter.rewrite(current);
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
      log.error("Could not rebuild {}", component.getClass(), e);
      return component;
    }
  }

  /** True when a value is a non-empty collection of components — the only lists worth walking. */
  public static boolean isComponentList(Object value) {
    return value instanceof Collection<?> collection
        && !collection.isEmpty()
        && collection.iterator().next() instanceof Component;
  }

  /** The components of a list value, in order. */
  @SuppressWarnings("unchecked")
  public static List<Component> componentsOf(Object value) {
    return new ArrayList<>((Collection<Component>) value);
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
