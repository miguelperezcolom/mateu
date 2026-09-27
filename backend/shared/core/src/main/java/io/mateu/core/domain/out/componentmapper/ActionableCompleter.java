package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.AppMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.uidl.Humanizer.toCamelCase;

import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RemoteMenu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import java.lang.reflect.Field;
import java.util.List;

final class ActionableCompleter {

  static List<Actionable> completeActionables(String appRoute, List<Actionable> menu) {
    if (menu == null) {
      return null;
    }
    return menu.stream()
        .map(
            actionable -> {
              if (actionable instanceof ContentLink contentLink) {
                if (contentLink.path() == null) {
                  return contentLink.withPath(appRoute + "/" + toCamelCase(contentLink.label()));
                }
              }
              return actionable;
            })
        .toList();
  }

  static Actionable completeActionable(String appRoute, Field field, Object instance) {
    var actionable = (Actionable) getValue(field, instance);
    if (actionable.label() == null || actionable.label().isEmpty()) {
      if (actionable instanceof RouteLink routeLink) {
        actionable = routeLink.withLabel(getLabel(field));
      }
      if (actionable instanceof ContentLink contentLink) {
        actionable = contentLink.withLabel(getLabel(field));
      }
      if (actionable instanceof FieldLink fieldLink) {
        actionable = fieldLink.withLabel(getLabel(field));
      }
      if (actionable instanceof MethodLink methodLink) {
        actionable = methodLink.withLabel(getLabel(field));
      }
      if (actionable instanceof RemoteMenu remoteMenu) {
        actionable = remoteMenu.withLabel(getLabel(field));
      }
    }
    if (actionable.path() == null || actionable.path().isEmpty()) {
      if (actionable instanceof RouteLink routeLink) {
        actionable = routeLink.withPath("/" + field.getName());
      }
      if (actionable instanceof ContentLink contentLink) {
        actionable = contentLink.withPath("/" + field.getName());
      }
      if (actionable instanceof FieldLink fieldLink) {
        actionable = fieldLink.withPath("/" + field.getName());
      }
      if (actionable instanceof MethodLink methodLink) {
        actionable = methodLink.withPath("/" + field.getName());
      }
      if (actionable instanceof RemoteMenu remoteMenu) {
        actionable = remoteMenu.withPath("/" + field.getName());
      }
    }
    return actionable;
  }

  private ActionableCompleter() {}
}
