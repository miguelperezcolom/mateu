package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getCrud;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.componentmapper.ViewTypeClassifier.isApp;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.core.infra.reflection.MetaAnnotations;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.ContentLayout;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import lombok.SneakyThrows;

final class PageContentBuilder {

  @SneakyThrows
  static Collection<? extends Component> getContent(
      Object instanceOrType,
      String baseUrl,
      String route,
      String consumedRoute,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    Object instance;
    if (instanceOrType instanceof Class<?> type) {
      instance = MateuBeanProvider.getBean(InstanceFactory.class).newInstance(type, httpRequest);
    } else {
      instance = instanceOrType;
    }
    if (instance instanceof ContentSupplier contentSupplier) {
      return contentSupplier.content();
    }
    if (instance instanceof Listing<?> || instance instanceof ReactiveListing<?>) {
      return getCrud(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (isApp(instance.getClass(), route)) {
      return List.of(
          mapToAppComponent(
              instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    }
    if (isForm(instance)) {
      var form =
          getForm(
              instance,
              baseUrl,
              route,
              consumedRoute,
              initiatorComponentId,
              httpRequest,
              false,
              false,
              getFormColumns(instance.getClass()),
              0);
      return wrapAsideIfPresent(instance, form, baseUrl, route, initiatorComponentId, httpRequest);
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> !Modifier.isFinal(field.getModifiers()))
        .filter(
            field ->
                !MetaAnnotations.isPresent(field, io.mateu.uidl.annotations.Button.class)
                    && !MetaAnnotations.isPresent(field, Toolbar.class)
                    && !MetaAnnotations.isPresent(field, Header.class)
                    && !MetaAnnotations.isPresent(field, Footer.class)
                    && !MetaAnnotations.isPresent(field, Avatar.class)
                    && !MetaAnnotations.isPresent(field, Menu.class)
                    && !Status.class.equals(field.getType()))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }

  /**
   * If the form declares any {@link Aside} component-holder field, pull those out into the {@code
   * aside} slot of a {@link ContentLayout} that wraps the rest of the form (the {@code main} slot)
   * — the minimal way to compose the Redwood content-page grammar from a plain form. The aside
   * placement (side/width/sticky) comes from the FIRST {@code @Aside} field. When no {@code @Aside}
   * field exists the form is returned untouched (the common case, zero overhead).
   */
  private static Collection<? extends Component> wrapAsideIfPresent(
      Object instance,
      Collection<? extends Component> form,
      String baseUrl,
      String route,
      String initiatorComponentId,
      HttpRequest httpRequest) {
    var asideFields =
        getAllFields(instance.getClass()).stream()
            .filter(field -> MetaAnnotations.isPresent(field, Aside.class))
            .toList();
    if (asideFields.isEmpty()) {
      return form;
    }
    List<Component> aside = new ArrayList<>();
    for (var field : asideFields) {
      var value = getValue(field, instance); // ValueProvider unwraps Callable/Supplier holders
      if (value instanceof Component component) {
        aside.add(component);
      } else if (value != null) {
        aside.add(mapToComponent(value, baseUrl, route, initiatorComponentId, httpRequest));
      }
    }
    if (aside.isEmpty()) {
      return form;
    }
    var first = MetaAnnotations.find(asideFields.get(0), Aside.class);
    var width = first.width() != null && !first.width().isBlank() ? first.width() : null;
    return List.of(
        ContentLayout.builder()
            .id("content")
            .main(List.copyOf(form))
            .aside(aside)
            .asidePosition(first.position())
            .asideWidth(width)
            .asideSticky(first.sticky())
            .build());
  }
}
