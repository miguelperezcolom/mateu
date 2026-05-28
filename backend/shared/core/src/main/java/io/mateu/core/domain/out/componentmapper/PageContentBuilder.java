package io.mateu.core.domain.out.componentmapper;

import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getForm;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.getFormColumns;
import static io.mateu.core.domain.out.componentmapper.PageFormBuilder.isForm;
import static io.mateu.core.domain.out.componentmapper.PageListingBuilder.getCrud;
import static io.mateu.core.domain.out.componentmapper.ReflectionAppMapper.mapToAppComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionComponentMapper.mapToComponent;
import static io.mateu.core.domain.out.componentmapper.ReflectionObjectToComponentMapper.isApp;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValue;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Avatar;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.di.MateuBeanProvider;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ContentSupplier;
import io.mateu.uidl.interfaces.*;
import java.lang.reflect.Modifier;
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
    if (instance instanceof ListingBackend<?, ?>
        || instance instanceof ReactiveListingBackend<?, ?>) {
      return getCrud(instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest);
    }
    if (isApp(instance.getClass(), route)) {
      return List.of(
          mapToAppComponent(
              instance, baseUrl, route, consumedRoute, initiatorComponentId, httpRequest));
    }
    if (isForm(instance)) {
      return getForm(
          instance,
          baseUrl,
          route,
          consumedRoute,
          initiatorComponentId,
          httpRequest,
          false,
          false,
          getFormColumns(instance.getClass()));
    }
    return getAllFields(instance.getClass()).stream()
        .filter(field -> !Modifier.isFinal(field.getModifiers()))
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Button.class)
                    && !field.isAnnotationPresent(Toolbar.class)
                    && !field.isAnnotationPresent(Header.class)
                    && !field.isAnnotationPresent(Footer.class)
                    && !field.isAnnotationPresent(Avatar.class)
                    && !field.isAnnotationPresent(Menu.class)
                    && !Status.class.equals(field.getType()))
        .map(
            field ->
                mapToComponent(
                    getValue(field, instance), baseUrl, route, initiatorComponentId, httpRequest))
        .toList();
  }
}
