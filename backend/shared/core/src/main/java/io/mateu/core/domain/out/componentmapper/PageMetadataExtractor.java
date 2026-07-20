package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;
import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.KPI;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PeerNav;
import io.mateu.uidl.interfaces.*;
import java.util.List;
import lombok.SneakyThrows;

final class PageMetadataExtractor {

  static String getPageTitle(Object instance) {
    if (instance instanceof PageTitleSupplier pageTitleSupplier) {
      return TranslatorContext.translate(pageTitleSupplier.pageTitle());
    }
    if (MetaAnnotations.isPresent(instance.getClass(), PageTitle.class)) {
      return TranslatorContext.translate(
          MetaAnnotations.find(instance.getClass(), PageTitle.class).value());
    }
    return TranslatorContext.translate(toUpperCaseFirst(instance.getClass().getSimpleName()));
  }

  static String getTitle(Object instance) {
    if (instance instanceof TitleSupplier titleSupplier) {
      return TranslatorContext.translate(titleSupplier.title());
    }
    if (MetaAnnotations.isPresent(instance.getClass(), Title.class)) {
      return TranslatorContext.translate(
          MetaAnnotations.find(instance.getClass(), Title.class).value());
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
    if (MetaAnnotations.isPresent(instance.getClass(), Subtitle.class)) {
      return TranslatorContext.translate(
          MetaAnnotations.find(instance.getClass(), Subtitle.class).value());
    }
    return null;
  }

  static String getFavicon(Object instance) {
    if (MetaAnnotations.isPresent(instance.getClass(), FavIcon.class)) {
      return MetaAnnotations.find(instance.getClass(), FavIcon.class).value();
    }
    return null;
  }

  static String getCssClasses(Object instance) {
    if (MetaAnnotations.isPresent(instance.getClass(), CssClasses.class)) {
      return MetaAnnotations.find(instance.getClass(), CssClasses.class).value();
    }
    return null;
  }

  static String getStyle(Object instance) {
    var style =
        MetaAnnotations.isPresent(instance.getClass(), Style.class)
            ? MetaAnnotations.find(instance.getClass(), Style.class).value()
            : "";
    if (MetaAnnotations.isPresent(instance.getClass(), io.mateu.uidl.annotations.Compact.class)) {
      style = style + ";" + io.mateu.uidl.StyleConstants.COMPACT;
    }
    return style.isBlank() ? null : style;
  }

  /**
   * Tri-state flag for the sticky sections index (see {@link Toc}): {@code null} when the
   * annotation is absent (frontend auto-heuristic), otherwise the annotation's {@code value()}.
   */
  static Boolean getToc(Object instance) {
    var c = instance instanceof Class ? (Class) instance : instance.getClass();
    return MetaAnnotations.isPresent(c, Toc.class)
        ? MetaAnnotations.find(c, Toc.class).value()
        : null;
  }

  /**
   * Tri-state page width (see {@link PageWidth}): {@code null} when neither the annotation nor the
   * {@link PageWidthSupplier} hook says anything (the renderer infers it from the content,
   * defaulting to {@code FIXED}). The annotation on the concrete view class wins over the hook, so
   * a view can override the width its archetype declares.
   */
  static PageWidthStyle getPageWidth(Object instance) {
    var c = instance instanceof Class ? (Class) instance : instance.getClass();
    var annotation = MetaAnnotations.find(c, PageWidth.class);
    if (annotation != null) {
      return annotation.value();
    }
    if (instance instanceof PageWidthSupplier pageWidthSupplier) {
      return pageWidthSupplier.pageWidth();
    }
    return null;
  }

  static List<Badge> getBadges(Object instance, HttpRequest httpRequest) {
    if (instance instanceof BadgeSupplier badgeSupplier) {
      return badgeSupplier.badges().stream()
          .filter(b -> b != null && b.text() != null && !b.text().isBlank())
          .toList();
    }
    // Fields annotated with @BadgeInHeader generate reactive expression-based badges so they
    // update when state changes without needing a full component re-render.
    return getAllFields(instance.getClass()).stream()
        .filter(
            field ->
                MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.BadgeInHeader.class))
        .map(
            field -> {
              var ann = MetaAnnotations.find(field, io.mateu.uidl.annotations.BadgeInHeader.class);
              String label =
                  ann.label().isBlank() ? FieldMetadataExtractor.getLabel(field) : ann.label();
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

  static List<KPI> getKpis(Object instance) {
    return getAllFields(instance.getClass()).stream()
        .filter(field -> MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.KPI.class))
        .map(
            field -> {
              field.setAccessible(true);
              String text;
              try {
                Object value = field.get(instance);
                text = value != null ? value.toString() : "";
              } catch (Exception e) {
                text = "${state." + field.getName() + "}";
              }
              return KPI.builder().title(FieldMetadataExtractor.getLabel(field)).text(text).build();
            })
        .toList();
  }

  @SneakyThrows
  static List<PageBanner> getBanners(Object instance, HttpRequest httpRequest) {
    if (instance instanceof BannerSupplier bannerSupplier) {
      return bannerSupplier.banners();
    }
    return getAllMethods(instance.getClass()).stream()
        .filter(method -> MetaAnnotations.isPresent(method, Banner.class))
        .map(
            method -> {
              var ann = MetaAnnotations.find(method, Banner.class);
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

  /**
   * Lateral peer navigation (previous/next object arrows in the header) from a {@link
   * PeerNavigationSupplier}. {@code null} when the page supplies none.
   */
  static PeerNav getPeerNav(Object instance, HttpRequest httpRequest) {
    if (instance instanceof PeerNavigationSupplier supplier) {
      return supplier.peers(httpRequest);
    }
    return null;
  }

  /**
   * The page's "last updated" timestamp from the first {@code @Timestamp} field, as text (an
   * optional label prefix + the value's {@code toString()}). {@code null} when there is no such
   * field or its value is null.
   */
  @SneakyThrows
  static String getTimestamp(Object instance) {
    for (var field : getAllFields(instance.getClass())) {
      if (!MetaAnnotations.isPresent(field, Timestamp.class)) {
        continue;
      }
      field.setAccessible(true);
      Object value = field.get(instance);
      if (value == null) {
        return null;
      }
      String prefix = MetaAnnotations.find(field, Timestamp.class).value();
      return prefix.isBlank() ? value.toString() : prefix + " " + value;
    }
    return null;
  }
}
