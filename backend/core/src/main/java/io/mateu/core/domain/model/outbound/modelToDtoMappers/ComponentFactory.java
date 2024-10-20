package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.ComponentMetadataBuilder;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.ComponentId;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.SplitLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.TabLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import io.mateu.dtos.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ComponentFactory {

  private final ComponentMetadataBuilder componentMetadataBuilder;
  private final DataExtractor dataExtractor;
  private final ActualUiInstanceProvider actualUiInstanceProvider;
  private final ReflectionHelper reflectionHelper;
  private final FormIdentifier formIdentifier;

  public ComponentFactory(
      ComponentMetadataBuilder componentMetadataBuilder,
      DataExtractor dataExtractor,
      ActualUiInstanceProvider actualUiInstanceProvider,
      ReflectionHelper reflectionHelper,
      FormIdentifier formIdentifier) {
    this.componentMetadataBuilder = componentMetadataBuilder;
    this.dataExtractor = dataExtractor;
    this.actualUiInstanceProvider = actualUiInstanceProvider;
    this.reflectionHelper = reflectionHelper;
    this.formIdentifier = formIdentifier;
  }

  public Component createFormComponent(
      Object componentInstance, ServerHttpRequest serverHttpRequest, Map<String, Object> data) {
    ComponentMetadata metadata = componentMetadataBuilder.getFormMetadata(componentInstance, data);
    return new GenericComponent(
        metadata,
        UUID.randomUUID().toString(),
        getComponentClassName(componentInstance),
        Map.of(),
        dataExtractor.getData(componentInstance),
        List.of());
  }

  private static String getComponentClassName(Object componentInstance) {
    return componentInstance.getClass().getName();
  }

  public String createComponent(
      boolean form,
      Object componentInstance,
      ServerHttpRequest serverHttpRequest,
      Field field,
      List<Field> fields,
      Map<String, Component> allComponentsInStep,
      AtomicInteger componentCounter,
      Map<String, Object> data) {

    // todo: s no es componente reconocido, meter en un form sin caption y sin márgenes?

    String componentId = getComponentId(field, componentInstance, componentCounter);
    ComponentMetadata metadata =
        componentMetadataBuilder.getMetadata(form, componentInstance, field, fields, data);
    var actualComponentInstance =
        actualUiInstanceProvider.getActualUiInstance(componentInstance, serverHttpRequest);
    Component component;
    if (form) {
      component =
          new GenericComponent(
              metadata,
              componentId,
              getComponentClassName(componentInstance),
              Map.of(),
              dataExtractor.getData(componentInstance, actualComponentInstance),
              getChildComponents(
                  form,
                  actualComponentInstance,
                  field,
                  serverHttpRequest,
                  allComponentsInStep,
                  componentCounter,
                  data));
    } else {
      if (actualComponentInstance instanceof Crud<?, ?>) {
        component =
            new CrudComponent(
                metadata,
                componentId,
                getComponentClassName(actualComponentInstance),
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    serverHttpRequest,
                    allComponentsInStep,
                    componentCounter,
                    data),
                Map.of(),
                List.of());
      } else if (isLayout(field, actualComponentInstance)) {
        var childComponents =
            getChildComponents(
                form,
                actualComponentInstance,
                field,
                serverHttpRequest,
                allComponentsInStep,
                componentCounter,
                data);
        if (metadata instanceof io.mateu.dtos.TabLayout tabLayout) {
          Map<String, String> componentIdPerTabId = new HashMap<>();
          for (int i = 0; i < tabLayout.tabs().size(); i++) {
            componentIdPerTabId.put(tabLayout.tabs().get(i).id(), childComponents.get(i));
          }
          metadata =
              new io.mateu.dtos.TabLayout(
                  tabLayout.tabs().stream()
                      .map(t -> new Tab(componentIdPerTabId.get(t.id()), t.active(), t.caption()))
                      .toList());
        }
        component =
            new GenericComponent(
                metadata,
                componentId,
                getComponentClassName(actualComponentInstance),
                Map.of(),
                Map.of(),
                childComponents);
      } else {
        component =
            new GenericComponent(
                metadata,
                componentId,
                getComponentClassName(actualComponentInstance),
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    serverHttpRequest,
                    allComponentsInStep,
                    componentCounter,
                    data));
      }
    }
    allComponentsInStep.put(component.id(), component);
    return component.id();
  }

  private static boolean isLayout(Field field, Object actualComponentInstance) {
    return (actualComponentInstance != null
            && (actualComponentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(VerticalLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(SplitLayout.class)))
        || (field != null
            && (field.isAnnotationPresent(HorizontalLayout.class)
                || field.isAnnotationPresent(VerticalLayout.class)
                || field.isAnnotationPresent(SplitLayout.class)
                || field.isAnnotationPresent(TabLayout.class)));
  }

  private List<String> getChildComponents(
      boolean form,
      Object actualComponentInstance,
      Field field,
      ServerHttpRequest serverHttpRequest,
      Map<String, Component> allComponentsInStep,
      AtomicInteger componentCounter,
      Map<String, Object> data) {
    if (actualComponentInstance instanceof List<?> list) {
      return list.stream()
          .map(
              o ->
                  createComponent(
                      true,
                      o,
                      serverHttpRequest,
                      null,
                      List.of(),
                      allComponentsInStep,
                      componentCounter,
                      data))
          .toList();
    }
    if (actualComponentInstance instanceof Container
        || (field != null
            && (field.isAnnotationPresent(HorizontalLayout.class)
                || field.isAnnotationPresent(VerticalLayout.class)
                || field.isAnnotationPresent(SplitLayout.class)
                || field.isAnnotationPresent(TabLayout.class)))
        || (actualComponentInstance != null
            && (actualComponentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(VerticalLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(SplitLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(TabLayout.class)))) {
      return reflectionHelper.getAllFields(actualComponentInstance.getClass()).stream()
          .map(f -> new Pair<>(f, getValue(f, actualComponentInstance)))
          .map(
              p ->
                  createComponent(
                      formIdentifier.isForm(p.getKey(), p.getValue()),
                      p.getValue(),
                      serverHttpRequest,
                      p.getKey(),
                      List.of(),
                      allComponentsInStep,
                      componentCounter,
                      data))
          .toList();
    }
    return List.of();
  }

  @SneakyThrows
  private Object getValue(Field f, Object actualComponentInstance) {
    var value = reflectionHelper.getValue(f, actualComponentInstance);
    if (value == null) {
      value = reflectionHelper.newInstance(f.getType());
    }
    return value;
  }

  private String getComponentId(
      Field field, Object componentInstance, AtomicInteger componentCounter) {
    if (field != null && field.isAnnotationPresent(ComponentId.class)) {
      return field.getAnnotation(ComponentId.class).value();
    }
    if (componentInstance != null
        && componentInstance.getClass().isAnnotationPresent(ComponentId.class)) {
      return componentInstance.getClass().getAnnotation(ComponentId.class).value();
    }
    return "component-" + componentCounter.getAndIncrement();
  }
}
