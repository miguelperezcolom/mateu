package io.mateu.core.testutil;

import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;

/**
 * Reflective walk over a wire DTO graph (records, lists, maps): collects every object of a type,
 * wherever it nests — children, metadata, card content, slotted components. Wire shape gotchas
 * (content inside metadata records, slotted children) stop mattering to the test.
 */
public final class WireWalk {

  public static <T> List<T> all(Object root, Class<T> type) {
    var found = new ArrayList<T>();
    walk(root, type, found, new IdentityHashMap<>());
    return found;
  }

  public static <T> T first(Object root, Class<T> type) {
    var all = all(root, type);
    return all.isEmpty() ? null : all.get(0);
  }

  private static <T> void walk(
      Object node, Class<T> type, List<T> found, IdentityHashMap<Object, Boolean> seen) {
    if (node == null || seen.put(node, Boolean.TRUE) != null) {
      return;
    }
    if (type.isInstance(node)) {
      found.add(type.cast(node));
    }
    if (node instanceof Collection<?> collection) {
      collection.forEach(item -> walk(item, type, found, seen));
      return;
    }
    if (node instanceof Map<?, ?> map) {
      map.values().forEach(item -> walk(item, type, found, seen));
      return;
    }
    if (!node.getClass().isRecord()) {
      return;
    }
    for (RecordComponent component : node.getClass().getRecordComponents()) {
      try {
        var accessor = component.getAccessor();
        accessor.setAccessible(true);
        walk(accessor.invoke(node), type, found, seen);
      } catch (ReflectiveOperationException | RuntimeException ignored) {
        // an accessor that cannot be read is not part of the tree
      }
    }
  }

  private WireWalk() {}
}
