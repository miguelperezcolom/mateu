package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import com.google.common.base.Strings;
import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.inbound.menuResolvers.MenuEntryFactory;
import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.app.MDDOpenEditorAction;
import io.mateu.uidl.interfaces.MateuSecurityManager;
import io.mateu.uidl.interfaces.MenuEntry;
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
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class MenuResolver {

  private final ReflectionService reflectionService;
  private final MateuSecurityManager mateuSecurityManager;
  private final MenuEntryFactory menuEntryFactory;
  private final Humanizer humanizer;
  private final CaptionProvider captionProvider;

  public Optional<MenuEntry> resolve(
      Object uiInstance, String actionId, ServerHttpRequest serverHttpRequest) {
    if ("____home____".equals(actionId)) {
      return Optional.of(buildHomeMenuEntry(uiInstance));
    }
    return Optional.ofNullable(resolve(uiInstance, "", actionId, serverHttpRequest));
  }

  private MenuEntry buildHomeMenuEntry(Object uiInstance) {
    return new MDDOpenEditorAction(captionProvider.getCaption(uiInstance), () -> uiInstance);
  }

  private MenuEntry resolve(
      Object menuHolder, String prefix, String actionId, ServerHttpRequest serverHttpRequest) {

    for (Field f : reflectionService.getAllFields(menuHolder.getClass())) {

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
        String journeyTypeId = prefix + humanizer.camelcasize(name);
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
    if (Strings.isNullOrEmpty(caption)) caption = humanizer.capitalize(name);

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
}
