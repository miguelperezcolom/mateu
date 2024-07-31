package io.mateu.core.domain.model.modelToDtoMappers;

import com.google.common.base.Strings;
import io.mateu.core.domain.model.menuResolvers.MenuEntryFactory;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Helper;
import io.mateu.core.domain.uidefinition.core.app.*;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.annotations.*;
import io.mateu.core.domain.uidefinition.shared.interfaces.MateuSecurityManager;
import io.mateu.core.domain.uidefinition.shared.interfaces.MenuEntry;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuResolver {

  private final ReflectionHelper reflectionHelper;
  private final MateuSecurityManager mateuSecurityManager;
  private final JpaRpcCrudFactory jpaRpcCrudFactory;
  private final MenuEntryFactory menuEntryFactory;

  public Optional<MenuEntry> resolve(
      Object uiInstance, String actionId, ServerHttpRequest serverHttpRequest) {
    if ("____home____".equals(actionId)) {
      return Optional.of(buildHomeMenuEntry(uiInstance));
    }
    return Optional.ofNullable(resolve(uiInstance, "", actionId, serverHttpRequest));
  }

  private MenuEntry buildHomeMenuEntry(Object uiInstance) {
    return new MDDOpenEditorAction(reflectionHelper.getCaption(uiInstance), () -> uiInstance);
  }

  private MenuEntry resolve(
      Object menuHolder, String prefix, String actionId, ServerHttpRequest serverHttpRequest) {

    for (FieldInterfaced f : reflectionHelper.getAllFields(menuHolder.getClass())) {

      if (actionId.startsWith(prefix + f.getName())) {

        if (!Modifier.isPublic(f.getModifiers())) {
          f.getField().setAccessible(true);
        }

        var menuEntry =
            getIfAuthorised(actionId, menuHolder, f, prefix, f.getName(), serverHttpRequest);

        if (menuEntry != null) {
          return menuEntry;
        }
      }
    }

    for (Method m : getAllMenuMethods(menuHolder.getClass())) {

      if (actionId.startsWith(prefix + m.getName())) {

        if (!Modifier.isPublic(m.getModifiers())) {
          m.setAccessible(true);
        }

        var menuEntry =
            getIfAuthorised(actionId, menuHolder, m, prefix, m.getName(), serverHttpRequest);

        if (menuEntry != null) {
          return menuEntry;
        }
      }
    }

    return null;
  }

  private MenuEntry getIfAuthorised(
      String actionId,
      Object menuHolder,
      AnnotatedElement f,
      String prefix,
      String name,
      ServerHttpRequest serverHttpRequest) {
    boolean add = false;

    if (!f.isAnnotationPresent(Private.class)) {
      add = true;
    } else if (isAuthenticated(serverHttpRequest)) {
      Private pa = f.getAnnotation(Private.class);
      if (pa != null) {
        add = check(pa, serverHttpRequest);
      } else add = true;
    }

    if (add) {

      if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) {
        String journeyTypeId = prefix + Helper.camelcasize(name);
        return resolve(actionId, menuHolder, f, name, journeyTypeId, serverHttpRequest);
      }
    }
    return null;
  }

  private boolean isAuthenticated(ServerHttpRequest serverHttpRequest) {
    return mateuSecurityManager.getPrincipal(serverHttpRequest) != null;
  }

  private boolean check(Private pa, ServerHttpRequest serverHttpRequest) {
    try {
      return mateuSecurityManager.check(pa, serverHttpRequest);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return false;
  }

  private MenuEntry resolve(
      String actionId,
      Object uiInstance,
      AnnotatedElement m,
      String name,
      String journeyTypeId,
      ServerHttpRequest serverHttpRequest) {
    String caption =
        (m.isAnnotationPresent(Submenu.class))
            ? m.getAnnotation(Submenu.class).value()
            : m.getAnnotation(MenuOption.class).value();
    if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(name);

    String icon = null;
    if (m.isAnnotationPresent(Submenu.class)) icon = m.getAnnotation(Submenu.class).icon();
    if (m.isAnnotationPresent(MenuOption.class)) icon = m.getAnnotation(MenuOption.class).icon();

    if (m.isAnnotationPresent(Submenu.class)) {

      return resolve(getValue(uiInstance, m), journeyTypeId + "_", actionId, serverHttpRequest);

    } else if (m.isAnnotationPresent(MenuOption.class)
        || m.isAnnotationPresent(Home.class)
        || m.isAnnotationPresent(PublicHome.class)
        || m.isAnnotationPresent(PrivateHome.class)) {

      if (actionId.equals(journeyTypeId)) {
        return buildMenuEntry(caption, m, getValue(uiInstance, m)).setIcon(icon);
      }
    }
    return null;
  }

  @SneakyThrows
  private MenuEntry buildMenuEntry(String caption, AnnotatedElement m, Object uiInstance) {
    return menuEntryFactory.buildMenuEntry(uiInstance, m, caption);
  }

  private List<Method> getAllMenuMethods(Class c) {
    List<Method> l = new ArrayList<>();

    if (c.getSuperclass() != null) l.addAll(getAllMenuMethods(c.getSuperclass()));

    for (Method f : c.getDeclaredMethods())
      if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) l.add(f);

    return l;
  }

  @SneakyThrows
  private Object getValue(Object object, AnnotatedElement e) {
    if (e instanceof FieldInterfaced) {
      var field = (FieldInterfaced) e;
      Object value = reflectionHelper.getValue(field, object);
      if (value == null) {
        value = reflectionHelper.newInstance(field.getType());
      }
      return value;
    } else if (e instanceof Method) {
      return ((Method) e).invoke(object);
    }
    return null;
  }
}
