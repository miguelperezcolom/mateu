package io.mateu.core.domain.act;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.ContentSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import java.lang.reflect.RecordComponent;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.function.Predicate;

/**
 * The fluent buttons of a component tree that carry their own handler — {@code new Button("Save",
 * () -> ...)} (a {@code Callable}) or {@code new Button("Ping", runnable)} — keyed by their action
 * id. One walk shared by the two sides of the contract, so they cannot disagree:
 *
 * <ul>
 *   <li>the RUNNER ({@link ComponentTreeActionRunner}) runs the handler of the button the actionId
 *       names;
 *   <li>the view ADVERTISES those ids ({@code TreeActionHarvester}): the web client only sends an
 *       action its component advertises, and a handler button has no action METHOD to be advertised
 *       by.
 * </ul>
 *
 * <p>The walk descends every Mateu (uidl) record of the tree — a {@code Card}'s content, a {@code
 * Form}'s header/footer, a tab, a dashboard panel… —, collections, maps and any {@link
 * ContentSupplier}; it never descends a nested {@link ComponentTreeSupplier} (an island runs and
 * advertises its own buttons) nor an application object.
 */
public final class FluentHandlerButtons {

  private FluentHandlerButtons() {}

  /** Whether the button runs a handler of its own on the server. */
  public static boolean hasHandler(Button button) {
    return button.actionId() != null
        && !button.actionId().isBlank()
        && (button.runnable() != null || button.callable() != null);
  }

  /** The first handler button whose action id is {@code actionId}, or null. */
  public static Button find(Object root, String actionId) {
    if (actionId == null) {
      return null;
    }
    var found = new Button[1];
    walk(
        root,
        root,
        button -> {
          if (actionId.equals(button.actionId())) {
            found[0] = button;
            return true;
          }
          return false;
        },
        new IdentityHashMap<>());
    return found[0];
  }

  /** The action ids of every handler button in the tree, in tree order. */
  public static Set<String> ids(Object root) {
    var ids = new LinkedHashSet<String>();
    walk(
        root,
        root,
        button -> {
          ids.add(button.actionId());
          return false;
        },
        new IdentityHashMap<>());
    return ids;
  }

  /** Visits the handler buttons; stops as soon as {@code visitor} answers true. */
  private static boolean walk(
      Object node, Object root, Predicate<Button> visitor, Map<Object, Boolean> visited) {
    if (node == null || node instanceof String || visited.put(node, Boolean.TRUE) != null) {
      return false;
    }
    if (node instanceof Button button && hasHandler(button)) {
      return visitor.test(button);
    }
    if (node != root && node instanceof ComponentTreeSupplier) {
      return false;
    }
    if (node instanceof Collection<?> items) {
      for (var item : items) {
        if (walk(item, root, visitor, visited)) {
          return true;
        }
      }
      return false;
    }
    if (node instanceof Map<?, ?> map) {
      for (var value : map.values()) {
        if (walk(value, root, visitor, visited)) {
          return true;
        }
      }
      return false;
    }
    if (node instanceof ContentSupplier contentSupplier && !node.getClass().isRecord()) {
      return walk(contentSupplier.content(), root, visitor, visited);
    }
    var type = node.getClass();
    if (!type.isRecord() || !type.getPackageName().startsWith("io.mateu.uidl")) {
      return false;
    }
    for (RecordComponent component : type.getRecordComponents()) {
      Object value;
      try {
        value = component.getAccessor().invoke(node);
      } catch (ReflectiveOperationException | RuntimeException e) {
        continue;
      }
      if (walk(value, root, visitor, visited)) {
        return true;
      }
    }
    return false;
  }
}
