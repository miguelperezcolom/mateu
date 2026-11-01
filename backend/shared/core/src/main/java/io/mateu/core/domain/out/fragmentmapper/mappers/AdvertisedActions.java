package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.interfaces.HttpRequest;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.lang.reflect.RecordComponent;
import java.util.Collection;
import java.util.IdentityHashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Callable;
import java.util.function.Supplier;
import lombok.extern.slf4j.Slf4j;

/**
 * The action ids a view ADVERTISES besides its marked methods — what strict action mode (the
 * default) lets an unannotated method answer to: the id is named by the view's own declaration, so
 * the method is the developer's declared handler for it, not an incidental public method.
 *
 * <p>The sources are the ones the renderers send action ids from: the view's action list (its
 * {@code ActionSupplier}/{@code ActionHandler} ids, class-level {@code @Action}s, triggers and
 * subscriptions, {@code @OnRowSelected}, {@code @AutoSave}), every {@code actionId}/{@code
 * *ActionId} of the components it holds or supplies (a fluent tree, a {@code Callable} island, a
 * header, a toolbar, a menu rule leaf, an app header action) and its {@code @AppShortcut}s — the
 * same rule the .NET and Python ports apply. An id only a previous RESPONSE named (an undo toast's
 * action) is not derivable from the view: that handler has to be marked ({@code @Action}).
 *
 * <p>Computed only when an action names an unmarked method, so the cost is paid by that path alone.
 */
@Slf4j
public final class AdvertisedActions {

  /** The interfaces whose no-arg / request-only methods supply components that can name actions. */
  private static final Set<String> COMPONENT_SUPPLIERS =
      Set.of(
          "ComponentTreeSupplier",
          "HeaderSupplier",
          "FooterSupplier",
          "ToolbarSupplier",
          "ButtonsSupplier",
          "BannerSupplier",
          "AppActionsSupplier",
          "RuleSupplier",
          "MenuSupplier",
          "WidgetSupplier",
          "TriggersSupplier");

  private static final int MAX_DEPTH = 24;

  private AdvertisedActions() {}

  /**
   * Whether {@code view} advertises {@code id}: its own code names it as a string literal (a {@code
   * confirmActionId("doArchive")} of a dialog an action returns, a fluent button…), or one of its
   * declarations / components does ({@link #of}). The literal check is static and cheap, so it goes
   * first; never throws.
   */
  public static boolean advertises(Object view, HttpRequest httpRequest, String id) {
    if (view == null || id == null || id.isBlank()) {
      return false;
    }
    // the check builds the view's lazy tree: the request has to be there first
    io.mateu.core.domain.RequestBound.bind(view, httpRequest);
    // an id a response to this view handed out (a dialog's confirm, an undo toast), or one the
    // view's declarations / components name. NOT any string literal of its class file: that let a
    // label or log text equal to a public method's name make the method callable (IssuedActions)
    return IssuedActions.issued(view, id) || of(view, httpRequest).contains(id);
  }

  /** Every action id {@code view} advertises for this request (never throws). */
  public static Set<String> of(Object view, HttpRequest httpRequest) {
    var ids = new LinkedHashSet<String>();
    if (view == null) {
      return ids;
    }
    try {
      for (var action : ActionMapper.createActions(view, httpRequest)) {
        ids.add(action.id());
      }
    } catch (RuntimeException e) {
      log.debug("Could not list the actions of {}: {}", view.getClass().getName(), e.toString());
    }
    var autoSave = MetaAnnotations.find(view.getClass(), io.mateu.uidl.annotations.AutoSave.class);
    if (autoSave != null) {
      ids.add(autoSave.action());
    }
    for (var shortcut :
        view.getClass().getAnnotationsByType(io.mateu.uidl.annotations.AppShortcut.class)) {
      ids.add(shortcut.actionId());
    }
    var visited = new IdentityHashMap<Object, Boolean>();
    collectFields(view, httpRequest, ids, visited, 0);
    collectSuppliers(view, httpRequest, ids, visited);
    collectYamlLayout(view, httpRequest, ids, visited);
    ids.removeIf(id -> id == null || id.isBlank() || id.contains("*"));
    return ids;
  }

  /** The components the view's fields hold (directly, or behind a Callable/Supplier). */
  private static void collectFields(
      Object owner,
      HttpRequest httpRequest,
      Set<String> ids,
      Map<Object, Boolean> visited,
      int depth) {
    if (owner == null || depth > 3 || visited.put(owner, Boolean.TRUE) != null) {
      return;
    }
    for (var field : getAllFields(owner.getClass())) {
      var section = MetaAnnotations.find(field, io.mateu.uidl.annotations.Section.class);
      if (section != null) {
        // the section header's affordances (+ Add, Edit, View more) dispatch these ids
        ids.add(section.addAction());
        ids.add(section.editAction());
        ids.add(section.viewMoreAction());
      }
      if (Modifier.isStatic(field.getModifiers())
          || io.mateu.core.application.security.WireTypes.isInjected(field)) {
        continue;
      }
      Object value;
      try {
        if (!field.canAccess(owner)) {
          field.setAccessible(true);
        }
        value = field.get(owner);
      } catch (ReflectiveOperationException | RuntimeException e) {
        continue;
      }
      if (isComponentHolder(field)) {
        value = resolveHolder(value);
      }
      if (value == null) {
        if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Menu.class)) {
          // a menu group declared by type: its entries are field initializers of that type
          collectFields(newInstanceOrNull(field.getType()), httpRequest, ids, visited, depth + 1);
        }
        continue;
      }
      if (isMateuValue(value.getClass()) || value instanceof Collection<?>) {
        walk(value, ids, visited, 0);
      } else if (MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Menu.class)) {
        collectFields(value, httpRequest, ids, visited, depth + 1);
      }
    }
  }

  private static void collectSuppliers(
      Object view, HttpRequest httpRequest, Set<String> ids, Map<Object, Boolean> visited) {
    for (var iface : allInterfaces(view.getClass())) {
      if (!iface.getPackageName().equals("io.mateu.uidl.interfaces")
          || !COMPONENT_SUPPLIERS.contains(iface.getSimpleName())) {
        continue;
      }
      for (Method method : iface.getMethods()) {
        if (Modifier.isStatic(method.getModifiers()) || method.getReturnType() == void.class) {
          continue;
        }
        var params = method.getParameterTypes();
        Object result;
        try {
          if (params.length == 0) {
            result = method.invoke(view);
          } else if (params.length == 1 && params[0] == HttpRequest.class) {
            result = method.invoke(view, httpRequest);
          } else {
            continue;
          }
        } catch (ReflectiveOperationException | RuntimeException e) {
          continue;
        }
        walk(result, ids, visited, 0);
      }
    }
  }

  /**
   * A YAML layout bound to the view ({@code @UISpec}, or a route whose {@code viewModel:} it is).
   */
  private static void collectYamlLayout(
      Object view, HttpRequest httpRequest, Set<String> ids, Map<Object, Boolean> visited) {
    try {
      if (!io.mateu.uidl.di.MateuBeanProvider.isInitialized()) {
        return;
      }
      var loader =
          io.mateu.uidl.di.MateuBeanProvider.getBean(
              io.mateu.core.application.runaction.YamlUidlLoader.class);
      if (loader == null) {
        return;
      }
      var uiSpec = MetaAnnotations.find(view.getClass(), io.mateu.uidl.annotations.UISpec.class);
      if (uiSpec != null) {
        walk(loader.loadFromSpec(uiSpec.value()), ids, visited, 0);
        return;
      }
      var rq = httpRequest != null ? httpRequest.runActionRq() : null;
      if (rq == null || rq.route() == null) {
        return;
      }
      var spec = loader.loadSpec(rq.route(), httpRequest);
      if (spec == null || !view.getClass().getName().equals(spec.modelView())) {
        return;
      }
      walk(spec.layout(), ids, visited, 0);
      walk(spec.triggers(), ids, visited, 0);
      if (spec.actions() != null) {
        spec.actions().forEach(action -> ids.add(action.id()));
      }
    } catch (RuntimeException e) {
      log.debug("No YAML layout for {}: {}", view.getClass().getName(), e.toString());
    }
  }

  private static Set<Class<?>> allInterfaces(Class<?> type) {
    var found = new LinkedHashSet<Class<?>>();
    for (Class<?> c = type; c != null; c = c.getSuperclass()) {
      addInterfaces(c, found);
    }
    return found;
  }

  private static void addInterfaces(Class<?> c, Set<Class<?>> found) {
    for (var iface : c.getInterfaces()) {
      if (found.add(iface)) {
        addInterfaces(iface, found);
      }
    }
  }

  /**
   * A {@code Callable}/{@code Supplier} field that holds a COMPONENT (an island, a header): its
   * declared result type is a Mateu component. A function field that is a button's handler (marked,
   * or returning anything else) is an action and is never called to look for ids.
   */
  private static boolean isComponentHolder(java.lang.reflect.Field field) {
    if (io.mateu.core.application.security.ActionMethods.isMarked(field)) {
      return false;
    }
    var type = field.getType();
    if (!Callable.class.isAssignableFrom(type) && !Supplier.class.isAssignableFrom(type)) {
      return false;
    }
    if (field.getGenericType() instanceof java.lang.reflect.ParameterizedType parameterized
        && parameterized.getActualTypeArguments().length == 1) {
      var argument = parameterized.getActualTypeArguments()[0];
      if (argument instanceof java.lang.reflect.ParameterizedType nested) {
        argument = nested.getRawType();
      }
      return argument instanceof Class<?> result
          && (io.mateu.uidl.fluent.Component.class.isAssignableFrom(result)
              || isMateuValue(result));
    }
    return false;
  }

  private static Object resolveHolder(Object value) {
    try {
      if (value instanceof Callable<?> callable) {
        return callable.call();
      }
      if (value instanceof Supplier<?> supplier) {
        return supplier.get();
      }
    } catch (Exception e) {
      return null;
    }
    return value;
  }

  private static Object newInstanceOrNull(Class<?> type) {
    if (type.isInterface() || Modifier.isAbstract(type.getModifiers()) || isMateuValue(type)) {
      return null;
    }
    try {
      var constructor = type.getDeclaredConstructor();
      constructor.setAccessible(true);
      return constructor.newInstance();
    } catch (ReflectiveOperationException | RuntimeException e) {
      return null;
    }
  }

  private static boolean isMateuValue(Class<?> type) {
    var name = type.getName();
    return name.startsWith("io.mateu.uidl.") || name.startsWith("io.mateu.dtos.");
  }

  /** Every {@code actionId}/{@code *ActionId} string of a tree of Mateu records. */
  private static void walk(Object node, Set<String> ids, Map<Object, Boolean> visited, int depth) {
    if (node == null || depth > MAX_DEPTH || node instanceof String) {
      return;
    }
    if (node instanceof Collection<?> items) {
      for (var item : items) {
        walk(item, ids, visited, depth + 1);
      }
      return;
    }
    if (node instanceof Map<?, ?> map) {
      for (var item : map.values()) {
        walk(item, ids, visited, depth + 1);
      }
      return;
    }
    var type = node.getClass();
    if (!type.isRecord() || !isMateuValue(type) || visited.put(node, Boolean.TRUE) != null) {
      return;
    }
    for (RecordComponent component : type.getRecordComponents()) {
      Object value;
      try {
        value = component.getAccessor().invoke(node);
      } catch (ReflectiveOperationException | RuntimeException e) {
        continue;
      }
      var name = component.getName();
      if (value instanceof String id) {
        if (name.equals("actionId") || name.endsWith("ActionId")) {
          ids.add(id);
        }
      } else {
        // a function-typed component (a fluent button's handler) is never called here
        walk(value, ids, visited, depth + 1);
      }
    }
  }
}
