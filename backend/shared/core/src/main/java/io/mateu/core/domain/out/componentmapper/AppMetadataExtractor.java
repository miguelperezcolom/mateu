package io.mateu.core.domain.out.componentmapper;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.fluent.AppLayout;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.util.Collection;

class AppMetadataExtractor {

  static AppLayout getLayout(Object instance, Collection<? extends Actionable> menu) {
    if (instance != null
        && MetaAnnotations.isPresent(instance.getClass(), io.mateu.uidl.annotations.App.class)) {
      var appLayout =
          MetaAnnotations.find(instance.getClass(), io.mateu.uidl.annotations.App.class).layout();
      if (appLayout != AppLayout.SINGLE_SLOT) {
        return appLayout;
      }
    }
    return AppLayout.SINGLE_SLOT;
  }

  static AppVariant getVariant(Object instance, Collection<? extends Actionable> menu) {
    if (instance != null
        && MetaAnnotations.isPresent(instance.getClass(), io.mateu.uidl.annotations.App.class)) {
      var appVariant =
          MetaAnnotations.find(instance.getClass(), io.mateu.uidl.annotations.App.class).value();
      if (appVariant != AppVariant.AUTO) {
        return appVariant;
      }
    }
    boolean hasMenuItems = menu.stream().anyMatch(a -> a instanceof Menu);
    if (hasMenuItems) {
      if (hasDeepMenu(menu)) return AppVariant.TILES;
      if (menu.size() > 7) return AppVariant.HAMBURGUER_MENU;
      return AppVariant.MENU_ON_TOP;
    }
    return AppVariant.TABS;
  }

  private static boolean hasDeepMenu(Collection<? extends Actionable> menu) {
    for (Actionable actionable : menu) {
      if (actionable instanceof Menu m) {
        for (Actionable child : m.submenu()) {
          if (child instanceof Menu) {
            return true;
          }
        }
      }
    }
    return false;
  }

  static String getLogo(Object instance) {
    if (MetaAnnotations.isPresent(instance.getClass(), Logo.class)) {
      return MetaAnnotations.find(instance.getClass(), Logo.class).value();
    }
    return null;
  }

  static String getFavicon(Object instance) {
    if (MetaAnnotations.isPresent(instance.getClass(), FavIcon.class)) {
      return MetaAnnotations.find(instance.getClass(), FavIcon.class).value();
    }
    return null;
  }

  static boolean isDrawerClosed(Object instance) {
    return MetaAnnotations.isPresent(instance.getClass(), DrawerClosed.class);
  }

  static String getCssClasses(Object instance) {
    if (MetaAnnotations.isPresent(instance.getClass(), CssClasses.class)) {
      return MetaAnnotations.find(instance.getClass(), CssClasses.class).value();
    }
    return null;
  }

  static String getStyle(Object instance) {
    if (MetaAnnotations.isPresent(instance.getClass(), Style.class)) {
      return MetaAnnotations.find(instance.getClass(), Style.class).value();
    }
    return null;
  }

  static Collection<? extends Component> getWidgets(
      Object instance,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    return AppWidgetExtractor.getWidgets(
        instance, baseUrl, route, initiatorComponentId, httpRequest);
  }

  static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return titleSupplier.title();
    }
    if (MetaAnnotations.isPresent(instance.getClass(), Title.class)) {
      return MetaAnnotations.find(instance.getClass(), Title.class).value();
    }
    return null;
  }

  static String getSubtitle(Object instance) {
    if (instance instanceof SubtitleSupplier subtitleSupplier) {
      return subtitleSupplier.subtitle();
    }
    if (MetaAnnotations.isPresent(instance.getClass(), Subtitle.class)) {
      return MetaAnnotations.find(instance.getClass(), Subtitle.class).value();
    }
    return null;
  }

  static String getPageTitle(Object instance) {
    if (instance instanceof PageTitleSupplier pageTitleSupplier) {
      return pageTitleSupplier.pageTitle();
    }
    if (MetaAnnotations.isPresent(instance.getClass(), PageTitle.class)) {
      return MetaAnnotations.find(instance.getClass(), PageTitle.class).value();
    }
    if (instance.getClass().isAnnotationPresent(UI.class)
        || instance.getClass().isAnnotationPresent(Route.class)) {
      return toUpperCaseFirst(instance.getClass().getSimpleName());
    }
    return null;
  }

  /**
   * Label of a menu-entry method: {@link Label @Label} value if present (composable via {@link
   * MetaAnnotations}), else the humanized method name. Delegates to {@link
   * FieldMetadataExtractor#getLabel(java.lang.reflect.AnnotatedElement)} so menu labels are
   * resolved (and translated) exactly like form field labels.
   */
  static String getLabel(Method method) {
    return FieldMetadataExtractor.getLabel(method);
  }

  /** Label of a menu-entry field; see {@link #getLabel(Method)}. */
  static String getLabel(Field field) {
    return FieldMetadataExtractor.getLabel(field);
  }
}
