package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import lombok.SneakyThrows;

final class PageMetadataExtractor {

  static String getPageTitle(Object instance) {
    if (instance instanceof PageTitleSupplier pageTitleSupplier) {
      return TranslatorContext.translate(pageTitleSupplier.pageTitle());
    }
    if (instance.getClass().isAnnotationPresent(PageTitle.class)) {
      return TranslatorContext.translate(
          instance.getClass().getAnnotation(PageTitle.class).value());
    }
    return TranslatorContext.translate(toUpperCaseFirst(instance.getClass().getSimpleName()));
  }

  static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return TranslatorContext.translate(titleSupplier.title());
    }
    if (instance.getClass().isAnnotationPresent(Title.class)) {
      return TranslatorContext.translate(instance.getClass().getAnnotation(Title.class).value());
    }
    if (instance instanceof NamedView namedView) {
      return TranslatorContext.translate(namedView.name());
    }
    if (instance instanceof Named named) {
      return TranslatorContext.translate(named.name());
    }
    if (instance != null) {
      try {
        if (instance.getClass().getMethod("toString").getDeclaringClass().equals(Object.class)) {
          return getPageTitle(instance);
        }
      } catch (NoSuchMethodException ignored) {
      }
      return TranslatorContext.translate(instance.toString());
    }
    return null;
  }

  static String getSubtitle(Object instance) {
    if (instance instanceof SubtitleSupplier subtitleSupplier) {
      return TranslatorContext.translate(subtitleSupplier.subtitle());
    }
    if (instance.getClass().isAnnotationPresent(Subtitle.class)) {
      return TranslatorContext.translate(instance.getClass().getAnnotation(Subtitle.class).value());
    }
    return null;
  }

  static String getFavicon(Object instance) {
    if (instance.getClass().isAnnotationPresent(FavIcon.class)) {
      return instance.getClass().getAnnotation(FavIcon.class).value();
    }
    return null;
  }

  static String getCssClasses(Object instance) {
    if (instance.getClass().isAnnotationPresent(CssClasses.class)) {
      return instance.getClass().getAnnotation(CssClasses.class).value();
    }
    return null;
  }

  static String getStyle(Object instance) {
    var style =
        instance.getClass().isAnnotationPresent(Style.class)
            ? instance.getClass().getAnnotation(Style.class).value()
            : "";
    if (instance.getClass().isAnnotationPresent(io.mateu.uidl.annotations.Compact.class)) {
      style = style + ";" + io.mateu.uidl.StyleConstants.COMPACT;
    }
    return style.isBlank() ? null : style;
  }

  static List<Badge> getBadges(Object instance, HttpRequest httpRequest) {
    if (instance instanceof BadgeSupplier badgeSupplier) {
      return badgeSupplier.badges().stream()
          .filter(b -> b != null && b.text() != null && !b.text().isBlank())
          .toList();
    }
    // Fields annotated with @Badge generate reactive expression-based badges so they
    // update when state changes without needing a full component re-render.
    return getAllFields(instance.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Badge.class))
        .map(field -> {
          var ann = field.getAnnotation(io.mateu.uidl.annotations.Badge.class);
          String label = ann.label().isBlank()
              ? FieldMetadataExtractor.getLabel(field)
              : ann.label();
          String text;
          if (boolean.class.equals(field.getType()) || Boolean.class.equals(field.getType())) {
            // Show badge only when the field is true
            text = "${state." + field.getName() + " ? '" + label + "' : ''}";
          } else {
            // Use the field value directly as badge text (empty/null = hidden)
            text = "${state." + field.getName() + "}";
          }
          return Badge.builder()
              .text(text)
              .color(ann.color())
              .primary(ann.primary())
              .small(ann.small())
              .pill(ann.pill())
              .build();
        })
        .toList();
  }

  @SneakyThrows
  static List<PageBanner> getBanners(Object instance, HttpRequest httpRequest) {
    if (instance instanceof BannerSupplier bannerSupplier) {
      return bannerSupplier.banners();
    }
    return getAllMethods(instance.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(Banner.class))
        .map(
            method -> {
              var ann = method.getAnnotation(Banner.class);
              String description = null;
              if (method.getReturnType() == String.class) {
                try {
                  method.setAccessible(true);
                  description = (String) method.invoke(instance);
                } catch (Exception ignored) {
                }
              }
              String title =
                  ann.title().isEmpty() ? FieldMetadataExtractor.getLabel(method) : ann.title();
              BannerTheme theme = ann.theme() != null ? ann.theme() : BannerTheme.INFO;
              return new PageBanner(
                  theme, title, description, ann.closeable(), ann.timeoutSeconds());
            })
        .toList();
  }
}
