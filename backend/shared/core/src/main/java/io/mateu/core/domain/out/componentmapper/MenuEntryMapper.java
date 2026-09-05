package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.Authorizer.isAuthorized;
import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.out.componentmapper.AppMetadataExtractor.getLabel;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;
import static io.mateu.uidl.Humanizer.toKebabCase;

import io.mateu.core.domain.AudienceGate;
import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MethodLink;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.Submenu;
import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.net.URI;
import java.util.List;

final class MenuEntryMapper {

  static Actionable mapToMenu(
      String appRoute, Method method, Object instance, String route, HttpRequest httpRequest) {
    if ("/".equals(appRoute)) {
      appRoute = "";
    }
    return new MethodLink(
        appRoute + "/" + method.getName(), getLabel(method), instance.getClass(), method.getName());
  }

  static Actionable mapToMenu(
      String appRoute, Field field, Object instance, String route, HttpRequest httpRequest) {
    if ("/".equals(appRoute)) {
      appRoute = "";
    }
    var menuAnnotation = MetaAnnotations.find(field, io.mateu.uidl.annotations.Menu.class);
    var description =
        (menuAnnotation != null && !menuAnnotation.description().isBlank())
            ? menuAnnotation.description()
            : null;
    if (Actionable.class.isAssignableFrom(field.getType())) {
      return ActionableCompleter.completeActionable(appRoute, field, instance);
    }
    if (String.class.equals(field.getType())) {
      var uri = (String) getValue(field, instance);
      if (uri != null) {
        return new RouteLink(uri, getLabel(field))
            .withPath("/" + field.getName())
            .withServerSideType(instance.getClass().getName())
            .withConsumedRoute(appRoute)
            .withDescription(description);
      }
      return new RouteLink(appRoute + "/" + toKebabCase(field.getName()), getLabel(field))
          .withPath("/" + field.getName())
          .withServerSideType(instance.getClass().getName())
          .withConsumedRoute(appRoute)
          .withDescription(description);
    }
    if (URI.class.equals(field.getType())) {
      var uri = (URI) getValue(field, instance);
      if (uri != null) {
        return new RouteLink(uri.toString(), getLabel(field))
            .withPath("/" + field.getName())
            .withDescription(description);
      }
      return new RouteLink(appRoute + "/" + toKebabCase(field.getName()), getLabel(field))
          .withPath("/" + field.getName())
          .withDescription(description);
    }
    // A leaf that RUNS client-side rules instead of navigating: a @Menu field typed Rule or
    // List<Rule>. The other leaf primitive (a route) is every branch around this one.
    if (Rule.class.equals(field.getType())) {
      var rule = (Rule) getValue(field, instance);
      return new RuleLink(getLabel(field), rule == null ? List.of() : List.of(rule))
          .withPath("/" + toKebabCase(field.getName()))
          .withDescription(description);
    }
    if (List.class.isAssignableFrom(field.getType())
        && getValue(field, instance) instanceof List<?> list
        && !list.isEmpty()
        && list.stream().allMatch(element -> element instanceof Rule)) {
      @SuppressWarnings("unchecked")
      var rules = (List<Rule>) list;
      return new RuleLink(getLabel(field), rules)
          .withPath("/" + toKebabCase(field.getName()))
          .withDescription(description);
    }
    if (Submenu.class.isAssignableFrom(field.getType())) {
      return new Menu(
              "/" + field.getName(),
              getLabel(field),
              AppMenuBuilder.getActionables(
                  appRoute,
                  getValueOrNewInstance(field, instance, httpRequest),
                  route,
                  httpRequest))
          .withDescription(description);
    }
    if (MenuSupplier.class.isAssignableFrom(field.getType())) {
      var menuSupplier = (MenuSupplier) getValue(field, instance);
      return new Menu(
              "/" + field.getName(),
              getLabel(field),
              completeActionables(appRoute, menuSupplier.menu(httpRequest)))
          .withDescription(description);
    }
    if (!isBasic(field.getType())) {
      if (getAllFields(field.getType()).stream()
          .anyMatch(
              childField ->
                  MetaAnnotations.isPresent(childField, io.mateu.uidl.annotations.Menu.class)
                      && isAuthorized(MetaAnnotations.find(childField, EyesOnly.class), httpRequest)
                      && AudienceGate.visible(
                          MetaAnnotations.find(childField, Audience.class), httpRequest))) {
        return new Menu(
                "/" + field.getName(),
                getLabel(field),
                AppMenuBuilder.getActionables(
                    appRoute,
                    getValueOrNewInstance(field, instance, httpRequest),
                    route,
                    httpRequest))
            .withDescription(description);
      }
    }
    return new FieldLink(
            "/" + field.getName(), getLabel(field), instance.getClass(), field.getName())
        .withDescription(description);
  }

  static List<Actionable> completeActionables(String appRoute, List<Actionable> menu) {
    return ActionableCompleter.completeActionables(appRoute, menu);
  }
}
