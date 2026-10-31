package io.mateu.core.application.microfrontends;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.DivDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.dtos.UIIncrementDto;
import java.lang.reflect.Constructor;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Finds the micro frontends of a response the host has to resolve, and puts their outcome in place.
 * A generic walk of the wire records (like {@code ReferencedRestSources}): a micro frontend can sit
 * anywhere a component can — children, a card's content, a tab — and a surface moving does not make
 * it go blind.
 */
final class MicroFrontendTree {

  /** A micro frontend to resolve, and the component that carries it. */
  record Found(ClientSideComponentDto host, MicroFrontendDto microFrontend) {}

  /** What replaces a found component: {@code REMOVE} drops it. */
  static final ComponentDto REMOVE =
      new ClientSideComponentDto(new DivDto(""), "_removed", List.of(), null, null, null);

  private record Shape(RecordComponent[] components, Constructor<?> canonical) {}

  private static final Map<Class<?>, Shape> SHAPES = new ConcurrentHashMap<>();

  private MicroFrontendTree() {}

  /** Every micro frontend of the increment's fragments the server has to resolve. */
  static List<Found> collect(UIIncrementDto increment) {
    var found = new ArrayList<Found>();
    collect(increment.fragments(), found, new IdentityHashMap<>());
    return found;
  }

  private static void collect(Object node, List<Found> found, Map<Object, Boolean> visited) {
    if (node == null || node instanceof String || visited.put(node, Boolean.TRUE) != null) {
      return;
    }
    if (node instanceof Collection<?> items) {
      items.forEach(item -> collect(item, found, visited));
      return;
    }
    if (node instanceof ClientSideComponentDto client
        && client.metadata() instanceof MicroFrontendDto microFrontend) {
      // what it embeds is the remote's, resolved by the remote itself
      if (microFrontend.server() != null) {
        found.add(new Found(client, microFrontend));
      }
      return;
    }
    if (!isWireRecord(node)) {
      return;
    }
    for (var component : shapeOf(node.getClass()).components()) {
      collect(read(component, node), found, visited);
    }
  }

  /**
   * The increment with each found component replaced by what {@code replacements} says (identity),
   * the same instance where nothing changed.
   */
  static UIIncrementDto rewrite(
      UIIncrementDto increment,
      IdentityHashMap<ClientSideComponentDto, ComponentDto> replacements) {
    var rewritten = rewrite(increment, replacements, false);
    return (UIIncrementDto) rewritten;
  }

  private static Object rewrite(
      Object node,
      IdentityHashMap<ClientSideComponentDto, ComponentDto> replacements,
      boolean inList) {
    if (node == null || node instanceof String) {
      return node;
    }
    if (node instanceof ClientSideComponentDto client && replacements.containsKey(client)) {
      var replacement = replacements.get(client);
      // a slot with nothing to paint outside a list: an empty element keeps the place valid
      return replacement == REMOVE && !inList ? emptyIn(client) : replacement;
    }
    if (node instanceof List<?> items) {
      List<Object> out = null;
      for (var i = 0; i < items.size(); i++) {
        var item = items.get(i);
        var next = rewrite(item, replacements, true);
        if (next != item && out == null) {
          out = new ArrayList<>(items.subList(0, i));
        }
        if (out != null && next != REMOVE) {
          out.add(next);
        }
      }
      return out == null ? node : out;
    }
    if (!isWireRecord(node) || node instanceof MicroFrontendDto) {
      return node;
    }
    var shape = shapeOf(node.getClass());
    if (shape.canonical() == null) {
      return node;
    }
    Object[] values = null;
    var components = shape.components();
    for (var i = 0; i < components.length; i++) {
      var current = read(components[i], node);
      var next = rewrite(current, replacements, false);
      if (next != current) {
        if (values == null) {
          values = new Object[components.length];
          for (var j = 0; j < components.length; j++) {
            values[j] = read(components[j], node);
          }
        }
        values[i] = next;
      }
    }
    if (values == null) {
      return node;
    }
    try {
      return shape.canonical().newInstance(values);
    } catch (ReflectiveOperationException e) {
      throw new IllegalStateException("Cannot rebuild " + node.getClass().getSimpleName(), e);
    }
  }

  private static ComponentDto emptyIn(ClientSideComponentDto client) {
    return new ClientSideComponentDto(
        new DivDto(""), client.id(), List.of(), client.style(), client.cssClasses(), client.slot());
  }

  private static boolean isWireRecord(Object node) {
    var type = node.getClass();
    return type.isRecord() && type.getPackageName().startsWith("io.mateu.dtos");
  }

  private static Object read(RecordComponent component, Object node) {
    try {
      return component.getAccessor().invoke(node);
    } catch (ReflectiveOperationException e) {
      return null;
    }
  }

  private static Shape shapeOf(Class<?> type) {
    return SHAPES.computeIfAbsent(
        type,
        t -> {
          var components = t.getRecordComponents();
          var types = new Class<?>[components.length];
          for (var i = 0; i < components.length; i++) {
            types[i] = components[i].getType();
          }
          try {
            return new Shape(components, t.getDeclaredConstructor(types));
          } catch (NoSuchMethodException e) {
            return new Shape(components, null);
          }
        });
  }
}
