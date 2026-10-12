package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.ClassLoaders.forName;

import io.mateu.core.domain.act.KeepAliveActionRunner;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.dtos.AppShortcutDto;
import io.mateu.dtos.HeaderValueDto;
import io.mateu.dtos.IdleSessionDto;
import io.mateu.uidl.LiveHeaderValues;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppShortcut;
import io.mateu.uidl.data.AppShortcutEntry;
import io.mateu.uidl.data.HeaderValue;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.HeaderValuesSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * The app-shell extras of the E2 patterns, each read from the data-authored shell ({@link
 * AppShell}, YAML or code) first and the app class second:
 *
 * <ul>
 *   <li>app-wide shortcuts and quick-launch codes ({@code @AppShortcut} / {@code shortcuts:});
 *   <li>live header values ({@link HeaderValuesSupplier} / {@code headerValues:}) and the live
 *       event stream ({@code @App(liveUpdates)});
 *   <li>the idle-session warning ({@code @App(idleTimeoutMinutes)}).
 * </ul>
 */
public final class AppShellExtrasMapper {

  private AppShellExtrasMapper() {}

  /** The shortcuts of the shell, then those of the class; routes made absolute like the menu's. */
  public static List<AppShortcutDto> shortcuts(AppShell app, String appRoute) {
    var result = new ArrayList<AppShortcutDto>();
    for (var entry : app.shortcuts()) {
      add(result, entry, appRoute);
    }
    var appClass = appClass(app);
    if (appClass != null) {
      for (var shortcut : appClass.getAnnotationsByType(AppShortcut.class)) {
        add(
            result,
            new AppShortcutEntry(
                shortcut.key(),
                shortcut.route(),
                shortcut.actionId(),
                shortcut.label(),
                shortcut.code()),
            appRoute);
      }
    }
    return result;
  }

  private static void add(List<AppShortcutDto> result, AppShortcutEntry entry, String appRoute) {
    var key = blankToNull(entry.key());
    var code = blankToNull(entry.code());
    var route = blankToNull(entry.route());
    var actionId = blankToNull(entry.actionId());
    if ((key == null && code == null) || (route == null && actionId == null)) {
      return; // nothing to press, or nowhere to go
    }
    var absolute = route == null ? null : absolute(appRoute, route);
    var label = blankToNull(entry.label());
    if (label == null) {
      label = route != null ? labelOf(route) : io.mateu.uidl.Humanizer.toUpperCaseFirst(actionId);
    }
    result.add(
        new AppShortcutDto(
            key != null ? key.toLowerCase() : null, label, absolute, actionId, code));
  }

  static String absolute(String appRoute, String route) {
    var base = appRoute == null ? "" : appRoute;
    if (!base.isEmpty() && (route.equals(base) || route.startsWith(base + "/"))) {
      return route;
    }
    return AppMenuDtoBuilder.prepend(base, route);
  }

  private static String labelOf(String route) {
    var path = route.replaceAll("/+$", "");
    var segment = path.substring(path.lastIndexOf('/') + 1);
    return segment.isEmpty()
        ? "Home"
        : io.mateu.uidl.Humanizer.toUpperCaseFirst(segment.replace('-', ' '));
  }

  /**
   * The shell's header values, then the supplier's (a value with the same id replaces the shell's)
   * and, for a live app, the last value PUBLISHED for each id — newer than both.
   */
  public static List<HeaderValueDto> headerValues(AppShell app, HttpRequest httpRequest) {
    Map<String, HeaderValue> byId = new LinkedHashMap<>();
    for (var value : app.headerValues()) {
      if (value != null && value.id() != null) byId.put(value.id(), value);
    }
    var appClass = appClass(app);
    if (appClass != null && HeaderValuesSupplier.class.isAssignableFrom(appClass)) {
      var supplier =
          (HeaderValuesSupplier)
              io.mateu.uidl.di.MateuBeanProvider.getBean(
                      io.mateu.uidl.interfaces.InstanceFactory.class)
                  .newInstance(appClass, Map.of(), httpRequest);
      var supplied = supplier.headerValues(httpRequest);
      if (supplied != null) {
        for (var value : supplied) {
          if (value != null && value.id() != null) byId.put(value.id(), value);
        }
      }
    }
    if (liveUpdates(app)) {
      LiveHeaderValues.current()
          .forEach(
              (id, published) -> {
                var declared = byId.get(id);
                if (declared != null) {
                  byId.put(id, new HeaderValue(id, declared.label(), published));
                }
              });
    }
    return byId.values().stream()
        .map(v -> new HeaderValueDto(v.id(), blankToNull(v.label()), v.value()))
        .toList();
  }

  public static boolean liveUpdates(AppShell app) {
    if (app.liveUpdates() != null) return app.liveUpdates();
    var annotation = appAnnotation(app);
    return annotation != null && annotation.liveUpdates();
  }

  public static IdleSessionDto idleSession(AppShell app) {
    var annotation = appAnnotation(app);
    int minutes =
        app.idleTimeoutMinutes() != null
            ? app.idleTimeoutMinutes()
            : annotation != null ? annotation.idleTimeoutMinutes() : 0;
    if (minutes <= 0) {
      return null;
    }
    int warning =
        app.idleWarningSeconds() != null
            ? app.idleWarningSeconds()
            : annotation != null ? annotation.idleWarningSeconds() : 60;
    var timeout = minutes * 60;
    // the warning can never start before the user has been idle at all
    warning = Math.max(5, Math.min(warning, timeout));
    var signOut = blankToNull(app.idleSignOutUrl());
    if (signOut == null && annotation != null) signOut = blankToNull(annotation.idleSignOutUrl());
    if (signOut == null)
      signOut = app.route() != null && !app.route().isBlank() ? app.route() : "/";
    return new IdleSessionDto(timeout, warning, signOut, KeepAliveActionRunner.ACTION_ID);
  }

  private static Class<?> appClass(AppShell app) {
    if (app.serverSideType() == null || app.serverSideType().isBlank()) return null;
    try {
      return forName(app.serverSideType());
    } catch (RuntimeException e) {
      return null;
    }
  }

  private static App appAnnotation(AppShell app) {
    var appClass = appClass(app);
    return appClass == null ? null : MetaAnnotations.find(appClass, App.class);
  }

  private static String blankToNull(String value) {
    return value == null || value.isBlank() ? null : value.trim();
  }
}
