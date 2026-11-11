package io.mateu.test;

import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Predicate;

/** Small helpers over the wire JSON (maps, lists, scalars). */
final class Json {

  private Json() {}

  static String str(Object value) {
    return value == null ? "" : String.valueOf(value);
  }

  @SuppressWarnings("unchecked")
  static Map<String, Object> map(Object value) {
    return value instanceof Map<?, ?> m ? (Map<String, Object>) m : Map.of();
  }

  @SuppressWarnings("unchecked")
  static List<Object> list(Object value) {
    if (value instanceof List<?> l) {
      return (List<Object>) l;
    }
    if (value instanceof Collection<?> c) {
      return new ArrayList<>(c);
    }
    return List.of();
  }

  static boolean bool(Object value) {
    return Boolean.TRUE.equals(value);
  }

  /** Every map of the tree (depth first, document order) the predicate accepts. */
  static List<Map<String, Object>> collect(Object root, Predicate<Map<String, Object>> accept) {
    var out = new ArrayList<Map<String, Object>>();
    walk(root, accept, out, new IdentityHashMap<>());
    return out;
  }

  @SuppressWarnings("unchecked")
  private static void walk(
      Object node,
      Predicate<Map<String, Object>> accept,
      List<Map<String, Object>> out,
      IdentityHashMap<Object, Boolean> seen) {
    if (node == null || seen.put(node, Boolean.TRUE) != null) {
      return;
    }
    if (node instanceof Map<?, ?> m) {
      var map = (Map<String, Object>) m;
      if (accept.test(map)) {
        out.add(map);
      }
      for (var value : map.values()) {
        walk(value, accept, out, seen);
      }
    } else if (node instanceof Collection<?> c) {
      for (var value : c) {
        walk(value, accept, out, seen);
      }
    }
  }
}
