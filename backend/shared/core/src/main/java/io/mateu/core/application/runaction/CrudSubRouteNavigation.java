package io.mateu.core.application.runaction;

import io.mateu.core.application.RoutedClassResolver;
import io.mateu.core.domain.CrudNavigation;
import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.Humanizer;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.NoCrudNavigation;
import io.mateu.uidl.annotations.NotEditable;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.interfaces.MateuInstanceFactory;
import jakarta.inject.Inject;
import jakarta.inject.Named;
import jakarta.inject.Singleton;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Gives a page that overrides a CRUD's sub-screen through an AUTHORED route the CRUD's standard
 * navigation ({@link CrudNavigation}), so the author does not write it.
 *
 * <p>The page is recognised by its route: the authored entry that answers it ({@code routes.yaml},
 * a {@code RouteEntrySupplier}) names this view model and has one of a CRUD's sub-route shapes —
 * {@code <base>/:id} (the record), {@code <base>/:id/edit} (the editor) or {@code <base>/new} (the
 * creation page) — and {@code <base>} is a CRUD: a class the route resolves to, or the
 * {@code @Menu} target the path reaches from an app. Its labels come from that CRUD's hooks and its
 * targets are the CRUD's routes. {@link NoCrudNavigation} on the view model turns it off.
 */
@Slf4j
@Named
@Singleton
@RequiredArgsConstructor(onConstructor_ = @Inject)
public class CrudSubRouteNavigation {

  private final RoutedClassResolver routedClassResolver;

  /** Computes the navigation of {@code instance} for this request, if it is such a page. */
  public void mark(Object instance, RunActionCommand command) {
    if (instance == null
        || instance instanceof Crud
        || command.route() == null
        || MetaAnnotations.isPresent(instance.getClass(), NoCrudNavigation.class)) {
      return;
    }
    try {
      var navigation = navigationOf(instance, command);
      if (navigation != null) {
        command.httpRequest().setAttribute(CrudNavigation.ATTRIBUTE, navigation);
      }
    } catch (RuntimeException e) {
      // never fail the page over an affordance
      log.debug("No CRUD navigation for {}: {}", instance.getClass().getName(), e.toString());
    }
  }

  private CrudNavigation navigationOf(Object instance, RunActionCommand command) {
    var route = stripQuery(command.route());
    var resolved = routedClassResolver.resolve(route, command).orElse(null);
    if (resolved == null
        || resolved.entry() == null
        || resolved.pattern() == null
        || !instance.getClass().equals(resolved.resolvedClass())) {
      return null;
    }
    var pattern = segments(resolved.pattern());
    var path = segments(route);
    if (pattern.size() < 2 || path.size() != pattern.size()) {
      return null;
    }
    var last = pattern.get(pattern.size() - 1);
    String kind;
    String id = null;
    int baseLength;
    if ("new".equals(last)) {
      kind = "new";
      baseLength = pattern.size() - 1;
    } else if ("edit".equals(last)
        && pattern.size() >= 3
        && pattern.get(pattern.size() - 2).startsWith(":")) {
      kind = "edit";
      id = path.get(path.size() - 2);
      baseLength = pattern.size() - 2;
    } else if (last.startsWith(":")) {
      kind = "view";
      id = path.get(path.size() - 1);
      baseLength = pattern.size() - 1;
    } else {
      return null;
    }
    var base = path.subList(0, baseLength);
    var crudClass = crudAt(base, command);
    if (crudClass == null) {
      return null;
    }
    var crud =
        (Crud)
            MateuInstanceFactory.newInstance(crudClass, java.util.Map.of(), command.httpRequest());
    var listRoute = "/" + String.join("/", base);
    var toolbar = new ArrayList<Button>();
    var buttons = new ArrayList<Button>();
    var targets = new LinkedHashMap<String, String>();
    switch (kind) {
      case "view" -> {
        toolbar.add(new Button(crud.backToListLabel(), "cancel-view"));
        targets.put("cancel-view", listRoute);
        if (crud.canEdit()
            && !crud.readOnly()
            && !MetaAnnotations.isPresent(crudClass, NotEditable.class)) {
          toolbar.add(new Button(crud.editLabel(), "edit"));
          targets.put("edit", listRoute + "/" + id + "/edit");
        }
      }
      case "edit" -> {
        buttons.add(new Button(crud.cancelLabel(), "cancel-edit"));
        targets.put("cancel-edit", listRoute + "/" + id);
      }
      default -> {
        buttons.add(new Button(crud.cancelLabel(), "cancel-new"));
        targets.put("cancel-new", listRoute);
      }
    }
    return new CrudNavigation(instance, List.copyOf(toolbar), List.copyOf(buttons), targets);
  }

  /**
   * The CRUD class at {@code base}: what the route resolves to, or the {@code @Menu} target the
   * path reaches from the class some shorter prefix resolves to (an app and its menu groups).
   */
  private Class<?> crudAt(List<String> base, RunActionCommand command) {
    var direct = classAt(base, command);
    if (direct != null && Crud.class.isAssignableFrom(direct)) {
      return direct;
    }
    for (int i = base.size() - 1; i >= 0; i--) {
      var owner = classAt(base.subList(0, i), command);
      if (owner == null) {
        continue;
      }
      var target = throughMenus(owner, base.subList(i, base.size()));
      if (target != null && Crud.class.isAssignableFrom(target)) {
        return target;
      }
    }
    return null;
  }

  private Class<?> classAt(List<String> segments, RunActionCommand command) {
    try {
      return routedClassResolver
          // the root mount is "" (as RouteInstanceCreator.rootClass asks for it), not "/"
          .resolve(segments.isEmpty() ? "" : "/" + String.join("/", segments), command)
          .map(io.mateu.core.application.ResolvedRoute::resolvedClass)
          .orElse(null);
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static Class<?> throughMenus(Class<?> owner, List<String> segments) {
    var current = owner;
    for (var segment : segments) {
      Class<?> next = null;
      for (Class<?> c = current; c != null && c != Object.class; c = c.getSuperclass()) {
        for (var field : c.getDeclaredFields()) {
          if (MetaAnnotations.isPresent(field, Menu.class)
              && segment.equals(Humanizer.toKebabCase(field.getName()))) {
            next = field.getType();
            break;
          }
        }
        if (next != null) {
          break;
        }
      }
      if (next == null) {
        return null;
      }
      current = next;
    }
    return current;
  }

  private static List<String> segments(String path) {
    return Arrays.stream(path.split("/")).filter(s -> !s.isBlank()).toList();
  }

  private static String stripQuery(String route) {
    var q = route.indexOf('?');
    return q < 0 ? route : route.substring(0, q);
  }
}
