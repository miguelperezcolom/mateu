package io.mateu.core.domain.out.componentmapper;

import static io.mateu.uidl.Humanizer.toUpperCaseFirst;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.interfaces.*;

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
    if (instance.getClass().isAnnotationPresent(Style.class)) {
      return instance.getClass().getAnnotation(Style.class).value();
    }
    return null;
  }
}
