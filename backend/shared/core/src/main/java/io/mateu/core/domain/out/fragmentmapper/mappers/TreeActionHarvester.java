package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.core.application.security.ActionMethods;
import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ServerSideComponentDto;
import java.lang.reflect.Method;
import java.lang.reflect.RecordComponent;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * The action ids a component tree references (a board's moveActionId, a tile's actionId, a
 * button's…) that the view supplying it has an action method for (public, or marked as an action —
 * the rule {@link ActionMethods} enforces). The web client only sends an action the component
 * advertises, so a click on a tree element whose handler is a plain method used to bubble out
 * unclaimed and be lost unless the method repeated the id with {@code @Action}.
 *
 * <p>Only ids with a handler method on the view are harvested: an id the view cannot handle may be
 * meant for an ancestor component, and advertising it here would capture it. Nested server side
 * components are not walked — an island advertises its own actions.
 */
public final class TreeActionHarvester {

  public static List<ActionDto> withTreeActions(
      List<ActionDto> declared, Object view, ComponentDto tree) {
    return withTreeActions(declared, view, tree, null);
  }

  /**
   * As {@link #withTreeActions(List, Object, ComponentDto)}, for one caller: a catalogue action
   * whose {@code access:} the caller does not satisfy is not advertised.
   */
  public static List<ActionDto> withTreeActions(
      List<ActionDto> declared,
      Object view,
      ComponentDto tree,
      io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    var referenced = new LinkedHashSet<String>();
    collect(tree, referenced, new java.util.IdentityHashMap<>());
    if (referenced.isEmpty()) {
      return declared;
    }
    // exactly the methods the server lets an actionId run (ActionMethods), so what is advertised
    // is what will be accepted: a public method of the view, or one marked as an action
    Set<String> handled =
        getAllMethods(view.getClass()).stream()
            .filter(method -> ActionMethods.isInvocable(method, view.getClass()))
            .map(Method::getName)
            .collect(Collectors.toSet());
    var known = declared.stream().map(ActionDto::id).collect(Collectors.toSet());
    var all = new ArrayList<>(declared);
    for (var id : referenced) {
      if (handled.contains(id) && known.add(id)) {
        all.add(ActionDto.builder().id(id).build());
      }
    }
    // OWNER FIRST, then the action catalogue: an id the view neither declares nor has a method for
    // runs the catalogue entry of that id (a flow or a REST call, lowered like any page action).
    var unresolved = new LinkedHashSet<String>();
    for (var id : referenced) {
      if (!known.contains(id)) {
        unresolved.add(id);
      }
    }
    all.addAll(ActionCatalogMapper.referenced(unresolved, known, httpRequest));
    return all;
  }

  private static void collect(Object node, Set<String> ids, Map<Object, Boolean> visited) {
    if (node == null || visited.put(node, Boolean.TRUE) != null) {
      return;
    }
    // an island advertises its own actions; a FAB dispatches its own and is never advertised
    if (node instanceof ServerSideComponentDto || node instanceof io.mateu.dtos.FabDto) {
      return;
    }
    if (node instanceof Collection<?> items) {
      items.forEach(item -> collect(item, ids, visited));
      return;
    }
    if (node instanceof Map<?, ?> map) {
      map.values().forEach(value -> collect(value, ids, visited));
      return;
    }
    if (node instanceof ClientSideComponentDto client) {
      collect(client.metadata(), ids, visited);
      collect(client.children(), ids, visited);
      return;
    }
    var type = node.getClass();
    if (!type.isRecord() || !type.getPackageName().startsWith("io.mateu.dtos")) {
      return;
    }
    for (RecordComponent component : type.getRecordComponents()) {
      Object value;
      try {
        value = component.getAccessor().invoke(node);
      } catch (ReflectiveOperationException e) {
        continue;
      }
      var name = component.getName();
      if (value instanceof String id
          && !id.isBlank()
          && (name.equals("actionId") || name.endsWith("ActionId"))) {
        ids.add(id);
      } else if (!(value instanceof String)) {
        collect(value, ids, visited);
      }
    }
  }

  private TreeActionHarvester() {}
}
