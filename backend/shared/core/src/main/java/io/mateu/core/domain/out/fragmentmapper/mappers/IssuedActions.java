package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.UIFragmentActionDto;
import io.mateu.dtos.UIIncrementDto;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The action ids a view's RESPONSES have handed to the client — the confirm handler of a dialog one
 * of its actions returned ({@code confirmActionId("doArchive")}), the action of an undo toast, a
 * command naming an action — remembered per view class, so strict action mode lets the unannotated
 * method of that name answer when the client sends it back.
 *
 * <p>It replaces reading the view's constant pool ({@code ClassLiterals}), which advertised EVERY
 * string literal of the class: a label, a log line or an event name that happened to equal a public
 * method's name made that method callable from the browser. Now an id is advertised only when the
 * server actually emitted it as an action id — an overlay (dialog, drawer), a message or a command
 * of a response to that view.
 *
 * <p>Process-wide and bounded (ids per class, classes): the ids are developer-written constants,
 * not per-user data, so sharing them across sessions reveals nothing. A server restart forgets
 * them, so a dialog left open across a restart answers 403 to its confirm — the method can be
 * marked {@code @Action} to accept it regardless.
 */
public final class IssuedActions {

  private static final int MAX_CLASSES = 4096;
  private static final int MAX_IDS_PER_CLASS = 512;

  private static final Map<String, Set<String>> ISSUED = new ConcurrentHashMap<>();

  private IssuedActions() {}

  /** Records the action ids {@code increment} hands out on behalf of {@code view}. */
  public static void record(Object view, UIIncrementDto increment) {
    if (view == null || increment == null) {
      return;
    }
    var ids = new LinkedHashSet<String>();
    var visited = new java.util.IdentityHashMap<Object, Boolean>();
    if (increment.fragments() != null) {
      for (var fragment : increment.fragments()) {
        // only what the response ADDS (an overlay) — a re-rendered view advertises its own ids
        if (fragment != null && fragment.action() == UIFragmentActionDto.Add) {
          TreeActionHarvester.collectReferenced(fragment.component(), ids, visited);
        }
        // the row actions the served rows offer (a ColumnAction in a row): the client sends
        // action-on-row-<name> for them, and the row runner asks for <name>
        if (fragment != null) {
          collectRowActions(fragment.data(), ids, new java.util.IdentityHashMap<>(), 0);
        }
      }
    }
    TreeActionHarvester.collectReferenced(increment.messages(), ids, visited);
    TreeActionHarvester.collectReferenced(increment.commands(), ids, visited);
    ids.removeIf(id -> id == null || id.isBlank() || id.contains("*"));
    if (ids.isEmpty()) {
      return;
    }
    var key = TreeActionHarvester.ownerClassOf(view).getName();
    if (!ISSUED.containsKey(key) && ISSUED.size() >= MAX_CLASSES) {
      return;
    }
    var known = ISSUED.computeIfAbsent(key, k -> ConcurrentHashMap.newKeySet());
    for (var id : ids) {
      if (known.size() >= MAX_IDS_PER_CLASS) {
        break;
      }
      known.add(id);
    }
  }

  /** Whether a response to {@code view}'s class has handed {@code id} to the client. */
  public static boolean issued(Object view, String id) {
    if (view == null || id == null) {
      return false;
    }
    var key = TreeActionHarvester.ownerClassOf(view).getName();
    var known = ISSUED.get(key);
    return known != null && known.contains(id);
  }

  // data → ListingData → Page → rows → row → ColumnActionGroup → array → ColumnAction is 7 deep
  private static final int MAX_DEPTH = 10;

  /**
   * The {@code ColumnAction}s found in a response's data (a listing page's rows), walked through
   * collections, maps, arrays, records and the fields of plain row objects, bounded in depth.
   */
  private static void collectRowActions(
      Object node, Set<String> ids, Map<Object, Boolean> visited, int depth) {
    if (node == null || depth > MAX_DEPTH || ids.size() >= MAX_IDS_PER_CLASS) {
      return;
    }
    if (node instanceof io.mateu.uidl.data.ColumnAction action) {
      ids.add(action.methodNameInCrud());
      return;
    }
    var type = node.getClass();
    if (type.isPrimitive()
        || node instanceof CharSequence
        || node instanceof Number
        || node instanceof Boolean
        || node instanceof Enum<?>
        || node instanceof java.time.temporal.Temporal
        || visited.put(node, Boolean.TRUE) != null) {
      return;
    }
    if (node instanceof java.util.Collection<?> items) {
      for (var item : items) {
        collectRowActions(item, ids, visited, depth + 1);
      }
      return;
    }
    if (node instanceof Map<?, ?> map) {
      for (var value : map.values()) {
        collectRowActions(value, ids, visited, depth + 1);
      }
      return;
    }
    if (type.isArray()) {
      if (!type.getComponentType().isPrimitive()) {
        for (var item : (Object[]) node) {
          collectRowActions(item, ids, visited, depth + 1);
        }
      }
      return;
    }
    if (type.getName().startsWith("java.") || type.getName().startsWith("javax.")) {
      return;
    }
    for (var c = type; c != null && c != Object.class; c = c.getSuperclass()) {
      for (var field : c.getDeclaredFields()) {
        if (java.lang.reflect.Modifier.isStatic(field.getModifiers())
            || field.getType().isPrimitive()) {
          continue;
        }
        try {
          if (!field.canAccess(node)) {
            field.setAccessible(true);
          }
          collectRowActions(field.get(node), ids, visited, depth + 1);
        } catch (ReflectiveOperationException | RuntimeException e) {
          // an inaccessible field (a module boundary): nothing to harvest there
        }
      }
    }
  }

  /** Test hook: forget everything. */
  static void clear() {
    ISSUED.clear();
  }
}
