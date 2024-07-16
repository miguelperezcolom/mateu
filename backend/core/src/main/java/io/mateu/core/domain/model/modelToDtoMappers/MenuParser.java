package io.mateu.core.domain.model.modelToDtoMappers;

import com.google.common.base.Strings;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.app.menuResolvers.MenuResolver;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.MateuSecurityManager;
import io.mateu.mdd.shared.interfaces.MenuEntry;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.util.Helper;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.net.URL;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuParser {

  private final ReflectionHelper reflectionHelper;
  private final MenuResolver menuResolver;

  public List<MenuEntry> parse(Object uiInstance, ServerHttpRequest serverHttpRequest) {
    return buildMenu(uiInstance, serverHttpRequest, true, true);
  }

  private List<MenuEntry> buildMenu(
      Object uiInstance,
      ServerHttpRequest serverHttpRequest,
      boolean authenticationAgnostic,
      boolean publicAccess) {
    List<MenuEntry> l = new ArrayList<>();

    for (FieldInterfaced f : reflectionHelper.getAllFields(uiInstance.getClass())) {

      if (!Modifier.isPublic(f.getModifiers())) {
        f.getField().setAccessible(true);
      }

      boolean add = false;

      if (publicAccess && !f.isAnnotationPresent(Private.class)) {
        add = true;
      }
      if (!publicAccess && f.isAnnotationPresent(Private.class)) {
        Private pa = f.getAnnotation(Private.class);
        if (pa != null) {
          add = authenticationAgnostic || check(pa, serverHttpRequest);
        } else add = true;
      }

      if (add) {

        if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) {

          addMenuEntry(uiInstance, l, f, authenticationAgnostic, publicAccess, serverHttpRequest);
        }
      }
    }

    for (Method m : getAllMenuMethods(uiInstance.getClass())) {

      if (!Modifier.isPublic(m.getModifiers())) {
        m.setAccessible(true);
      }

      boolean add = false;

      if (authenticationAgnostic) {
        add = true;
      } else {
        if (publicAccess && !m.isAnnotationPresent(Private.class)) {
          add = true;
        }
        if (!publicAccess && m.isAnnotationPresent(Private.class)) {
          Private pa = m.getAnnotation(Private.class);
          if (pa != null) {
            add = check(pa, serverHttpRequest);
          } else add = true;
        }
      }

      if (add) {
        addMenuEntry(uiInstance, l, m, authenticationAgnostic, publicAccess, serverHttpRequest);
      }
    }

    l.sort(Comparator.comparingInt(MenuEntry::getOrder));

    return l;
  }

  private boolean check(Private pa, ServerHttpRequest serverHttpRequest) {
    try {
      return Helper.getImpl(MateuSecurityManager.class).check(pa, serverHttpRequest);
    } catch (Exception e) {
      e.printStackTrace();
    }
    return false;
  }

  private void addMenuEntry(
      Object uiInstance,
      List<MenuEntry> l,
      Method m,
      boolean authenticationAgnostic,
      boolean publicAccess,
      ServerHttpRequest serverHttpRequest) {
    String caption =
        (m.isAnnotationPresent(Submenu.class))
            ? m.getAnnotation(Submenu.class).value()
            : m.getAnnotation(MenuOption.class).value();
    if (Strings.isNullOrEmpty(caption)) caption = Helper.capitalize(m.getName());

    String icon = null;
    if (m.isAnnotationPresent(Submenu.class)) icon = m.getAnnotation(Submenu.class).icon();
    if (m.isAnnotationPresent(MenuOption.class)) icon = m.getAnnotation(MenuOption.class).icon();

    int order = 0;
    if (m.isAnnotationPresent(MenuOption.class)) order = m.getAnnotation(MenuOption.class).order();
    else if (m.isAnnotationPresent(Submenu.class)) order = m.getAnnotation(Submenu.class).order();
    if (order == 0 || order == 10000) order = l.size();

    if (m.isAnnotationPresent(Submenu.class)) {

      l.add(
          new AbstractMenu(icon, caption) {
            @Override
            public List<MenuEntry> buildEntries() {
              try {
                return parse(uiInstance, serverHttpRequest);
              } catch (Throwable throwable) {
                throwable.printStackTrace();
              }
              return new ArrayList<>();
            }
          }.setOrder(order));

    } else if (m.isAnnotationPresent(MenuOption.class)
        || m.isAnnotationPresent(Home.class)
        || m.isAnnotationPresent(PublicHome.class)
        || m.isAnnotationPresent(PrivateHome.class)) {

      if (List.class.isAssignableFrom(m.getReturnType())
          && MenuEntry.class.equals(reflectionHelper.getGenericClass(m))) {

        l.add(
            new AbstractMenu(icon, caption) {
              @Override
              public List<MenuEntry> buildEntries() {
                List<MenuEntry> l = new ArrayList<>();
                try {

                  l =
                      (List<MenuEntry>)
                          reflectionHelper.invokeInjectableParametersOnly(m, uiInstance);

                } catch (Throwable e) {
                  e.printStackTrace();
                }
                return l;
              }
            }.setOrder(order));

      } else {

        l.add(new MDDCallMethodAction(caption, m, uiInstance).setIcon(icon).setOrder(order));
      }
    }
  }

  private void addMenuEntry(
      Object uiInstance,
      List<MenuEntry> l,
      FieldInterfaced f,
      boolean authenticationAgnostic,
      boolean publicAccess,
      ServerHttpRequest serverHttpRequest) {
    String caption = reflectionHelper.getCaption(f);

    String icon = null;
    if (f.isAnnotationPresent(Submenu.class)) icon = f.getAnnotation(Submenu.class).icon();
    if (f.isAnnotationPresent(MenuOption.class)) icon = f.getAnnotation(MenuOption.class).icon();

    int order = 0;
    if (f.isAnnotationPresent(MenuOption.class)) order = f.getAnnotation(MenuOption.class).order();
    else if (f.isAnnotationPresent(Submenu.class)) order = f.getAnnotation(Submenu.class).order();
    if (order == 0 || order == 10000) order = l.size();

    if (f.isAnnotationPresent(Submenu.class)) {

      if (!Modifier.isPublic(f.getModifiers())) {
        f.getField().setAccessible(true);
      }

      try {

        if (URL.class.equals(f.getType())) {
          l.add(new MDDOpenUrlAction(caption, (URL) reflectionHelper.getValue(f, uiInstance)));
        } else {
          Object v = reflectionHelper.getValue(f, uiInstance);
          if (v == null) v = reflectionHelper.newInstance(f.getType());
          Object finalV = v;
          l.add(
              new AbstractMenu(icon, caption) {
                @Override
                public List<MenuEntry> buildEntries() {
                  try {
                    return parse(finalV, serverHttpRequest);
                  } catch (Throwable throwable) {
                    throwable.printStackTrace();
                  }
                  return new ArrayList<>();
                }
              }.setOrder(order));
        }

      } catch (Exception e) {
        e.printStackTrace();
      }

    } else if (f.isAnnotationPresent(MenuOption.class)
        || f.isAnnotationPresent(Home.class)
        || f.isAnnotationPresent(PublicHome.class)
        || f.isAnnotationPresent(PrivateHome.class)) {

      try {

        if (!Modifier.isPublic(f.getModifiers())) {
          f.getField().setAccessible(true);
        }

        boolean menuResolved = false;

        menuResolved = menuResolver.addMenuEntry(uiInstance, l, f, caption, order, icon);

        if (!menuResolved) {
          addDefaultMenuEntry(uiInstance, l, f, caption, order, icon);
        }

      } catch (Exception e) {
        e.printStackTrace();
      }
    }
  }

  private void addDefaultMenuEntry(
      Object uiInstance,
      List<MenuEntry> l,
      FieldInterfaced f,
      String caption,
      int order,
      String icon)
      throws InvocationTargetException, NoSuchMethodException, IllegalAccessException {
    Object v = reflectionHelper.getValue(f, uiInstance);
    if (reflectionHelper.isBasico(f.getType()) || String.class.equals(f.getType())) {
      if (f.isAnnotationPresent(Home.class)
          || f.isAnnotationPresent(PublicHome.class)
          || f.isAnnotationPresent(PrivateHome.class))
        l.add(new MDDOpenHtmlAction("Home", "" + v).setIcon("home").setOrder(order));
      else l.add(new MDDOpenHtmlAction(caption, "" + v).setIcon(icon).setOrder(order));
    } else if (Listing.class.isAssignableFrom(f.getType())) {
      l.add(new MDDOpenListViewAction(caption, f.getType()).setIcon(icon).setOrder(order));
    } else
      l.add(
          new MDDOpenEditorAction(
                  caption,
                  () -> {
                    try {
                      return v != null ? v : reflectionHelper.newInstance(f.getType());
                    } catch (Exception e) {
                      e.printStackTrace();
                    }
                    return null;
                  })
              .setIcon(icon)
              .setOrder(order));
  }

  private List<Method> getAllMenuMethods(Class c) {
    List<Method> l = new ArrayList<>();

    if (c.getSuperclass() != null) l.addAll(getAllMenuMethods(c.getSuperclass()));

    for (Method f : c.getDeclaredMethods())
      if (f.isAnnotationPresent(MenuOption.class) || f.isAnnotationPresent(Submenu.class)) l.add(f);

    return l;
  }
}
