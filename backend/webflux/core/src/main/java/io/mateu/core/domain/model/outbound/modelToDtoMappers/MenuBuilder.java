package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.dtos.Menu;
import io.mateu.dtos.MenuType;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.interfaces.MateuSecurityManager;
import java.lang.reflect.AnnotatedElement;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class MenuBuilder {

  private final ReflectionService reflectionService;
  private final MateuSecurityManager mateuSecurityManager;
  private final Humanizer humanizer;

  @SneakyThrows
  public List<Menu> buildMenuForUi(Object uiInstance, ServerHttpRequest serverHttpRequest) {
    return buildMenu(uiInstance, "", serverHttpRequest);
  }

  public List<Menu> buildMenu(
      Object menuHolder, String prefix, ServerHttpRequest serverHttpRequest) {
    List<Menu> l = new ArrayList<>();

    for (Field f : reflectionService.getAllFields(menuHolder.getClass())) {

      if (!Modifier.isPublic(f.getModifiers())) {
        f.getField().setAccessible(true);
      }

      addIfAuthorised(menuHolder, l, (AnnotatedElement) f, prefix, f.getName(), serverHttpRequest);
    }

    for (Method m : getAllMenuMethods(menuHolder.getClass())) {

      if (!Modifier.isPublic(m.getModifiers())) {
        m.setAccessible(true);
      }

      addIfAuthorised(menuHolder, l, m, prefix, m.getName(), serverHttpRequest);
    }

    l.sort(Comparator.comparingInt(Menu::order));

    return l;
  }

  private void addIfAuthorised(
      Object uiInstance,
      List<Menu> l,
      AnnotatedElement f,
      String prefix,
      String name,
      ServerHttpRequest serverHttpRequest) {
    boolean add = false;

    if (!isAuthenticated(serverHttpRequest) && !f.isAnnotationPresent(Private.class)) {
      add = true;
    }
    if (isAuthenticated(serverHttpRequest) && f.isAnnotationPresent(Private.class)) {
      Private pa = f.getAnnotation(Private.class);
      if (pa != null) {
        add = check(pa, serverHttpRequest);
      } else add = true;
    }

    if (add) {

      if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) {
        String journeyTypeId = prefix + humanizer.camelcasize(name);
        addMenuEntry(uiInstance, l, f, name, journeyTypeId, serverHttpRequest);
      }
    }
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

  private void addMenuEntry(
      Object uiInstance,
      List<Menu> l,
      AnnotatedElement m,
      String name,
      String journeyTypeId,
      ServerHttpRequest serverHttpRequest) {
    String caption =
        (m.isAnnotationPresent(Submenu.class))
            ? m.getAnnotation(Submenu.class).value()
            : m.getAnnotation(MenuOption.class).value();
    if (Strings.isNullOrEmpty(caption)) caption = humanizer.capitalize(name);

    String icon = null;
    if (m.isAnnotationPresent(Submenu.class)) icon = m.getAnnotation(Submenu.class).icon();
    if (m.isAnnotationPresent(MenuOption.class)) icon = m.getAnnotation(MenuOption.class).icon();

    int order = 0;
    if (m.isAnnotationPresent(MenuOption.class)) order = m.getAnnotation(MenuOption.class).order();
    else if (m.isAnnotationPresent(Submenu.class)) order = m.getAnnotation(Submenu.class).order();
    if (order == 0 || order == 10000) order = l.size();

    String remoteBaseUrl = "";
    String remoteUiId = "";
    String remoteMenuId = "";
    MenuType menuType = MenuType.Submenu;
    if (m instanceof Field field && field.getType().equals(RemoteMenu.class)) {
      RemoteMenu remoteMenu = (RemoteMenu) getValue(uiInstance, m);
      if (remoteMenu != null) {
        remoteBaseUrl = remoteMenu.remoteBaseUrl();
        remoteUiId = remoteMenu.remoteUiId();
        remoteMenuId = remoteMenu.remoteMenuId();
        menuType = MenuType.Remote;
      }
    }

    if (m.isAnnotationPresent(Home.class)
        || m.isAnnotationPresent(PublicHome.class)
        || m.isAnnotationPresent(PrivateHome.class)) {
      l.add(new Menu(
              menuType,
              "home",
              "Home",
              "",
              List.of(),
              order,
              true,
              remoteBaseUrl,
              remoteUiId,
              remoteMenuId));
    } else if (m.isAnnotationPresent(Submenu.class)) {
      l.add(
          new Menu(
              menuType,
              icon,
              caption,
              journeyTypeId,
              buildMenu(getValue(uiInstance, m), journeyTypeId + "_", serverHttpRequest),
              order,
              m.getAnnotation(Submenu.class).visible(),
              remoteBaseUrl,
                  remoteUiId,
              remoteMenuId));
    } else {
      if (!MenuType.Remote.equals(menuType)) {
        menuType = MenuType.MenuOption;
      }
      l.add(
          new Menu(
              menuType,
              icon,
              caption,
              journeyTypeId,
              List.of(),
              order,
              isVisible(m),
              remoteBaseUrl,
              remoteUiId,
              remoteMenuId));
    }
  }

  private boolean isVisible(AnnotatedElement m) {
    if (m.isAnnotationPresent(Submenu.class)) {
      return m.getAnnotation(Submenu.class).visible();
    }
    if (m.isAnnotationPresent(MenuOption.class)) {
      return m.getAnnotation(MenuOption.class).visible();
    }
    return true;
  }

  @SneakyThrows
  private Object getValue(Object object, AnnotatedElement e) {
    if (e instanceof Field) {
      var field = (Field) e;
      Object value = reflectionService.getValue(field, object);
      if (value == null) {
        value = reflectionService.newInstance(field.getType());
      }
      return value;
    } else if (e instanceof Method) {
      return ((Method) e).invoke(object);
    }
    return null;
  }

  private List<Method> getAllMenuMethods(Class c) {
    List<Method> l = new ArrayList<>();

    if (c.getSuperclass() != null) l.addAll(getAllMenuMethods(c.getSuperclass()));

    for (Method f : c.getDeclaredMethods())
      if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) l.add(f);

    return l;
  }
}
