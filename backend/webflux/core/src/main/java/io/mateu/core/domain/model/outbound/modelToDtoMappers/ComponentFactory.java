package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.ComponentMetadataBuilder;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.dtos.*;
import io.mateu.dtos.TabDto;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.HorizontallyArranged;
import io.mateu.uidl.annotations.InTabsArranged;
import io.mateu.uidl.annotations.SplitArranged;
import io.mateu.uidl.annotations.VerticallyArranged;
import io.mateu.uidl.interfaces.Container;
import io.mateu.uidl.interfaces.Crud;
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
  private final ReflectionService reflectionService;
  private final FormIdentifier formIdentifier;

  public ComponentFactory(
      ComponentMetadataBuilder componentMetadataBuilder,
      DataExtractor dataExtractor,
      ActualUiInstanceProvider actualUiInstanceProvider,
      ReflectionService reflectionService,
      FormIdentifier formIdentifier) {
    this.componentMetadataBuilder = componentMetadataBuilder;
    this.dataExtractor = dataExtractor;
    this.actualUiInstanceProvider = actualUiInstanceProvider;
    this.reflectionService = reflectionService;
    this.formIdentifier = formIdentifier;
  }

  public ComponentDto createFormComponent(
      Object componentInstance,
      String baseUrl,
      ServerHttpRequest serverHttpRequest,
      Map<String, Object> data,
      boolean autoFocusDisabled) {
    ComponentMetadataDto metadata =
        componentMetadataBuilder.getFormMetadata(
            componentInstance, data, baseUrl, serverHttpRequest, autoFocusDisabled);
    return new GenericComponentDto(
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

  private Map<String, Object> getAttributes(Field field, Object componentInstance) {
    Map<String, Object> attributes = new HashMap<>();
    if (componentInstance == null) {
      return Map.of();
    }
    var type = componentInstance.getClass();
    if (type.isAnnotationPresent(Width.class)) {
      attributes.put("width", type.getAnnotation(Width.class).value());
    }
    if (type.isAnnotationPresent(MaxWidth.class)) {
      attributes.put("max-width", type.getAnnotation(MaxWidth.class).value());
    }
    if (type.isAnnotationPresent(MinWidth.class)) {
      attributes.put("min-width", type.getAnnotation(MinWidth.class).value());
    }

    if (field != null) {
      if (field.isAnnotationPresent(Width.class)) {
        attributes.put("width", field.getAnnotation(Width.class).value());
      }
      if (field.isAnnotationPresent(MaxWidth.class)) {
        attributes.put("max-width", field.getAnnotation(MaxWidth.class).value());
      }
      if (field.isAnnotationPresent(MinWidth.class)) {
        attributes.put("min-width", field.getAnnotation(MinWidth.class).value());
      }
    }
    return attributes;
  }

  public String createComponent(
      boolean form,
      Object componentInstance,
      String baseUrl,
      ServerHttpRequest serverHttpRequest,
      Field field,
      List<Field> fields,
      Map<String, ComponentDto> allComponentsInStep,
      AtomicInteger componentCounter,
      Map<String, Object> data) {

    // todo: s no es componente reconocido, meter en un form sin caption y sin márgenes?

    String componentId = getComponentId(field, componentInstance, componentCounter);
    ComponentMetadataDto metadata =
        componentMetadataBuilder.getMetadata(
            form, componentInstance, field, fields, data, baseUrl, serverHttpRequest, false);
    var actualComponentInstance =
        actualUiInstanceProvider.getActualUiInstance(componentInstance, serverHttpRequest);
    ComponentDto component;
    if (form) {
      component =
          new GenericComponentDto(
              metadata,
              componentId,
              getComponentClassName(componentInstance),
              getAttributes(field, componentInstance),
              dataExtractor.getData(componentInstance, actualComponentInstance),
              getChildComponents(
                  form,
                  actualComponentInstance,
                  field,
                  baseUrl,
                  serverHttpRequest,
                  allComponentsInStep,
                  componentCounter,
                  data));
    } else {
      if (actualComponentInstance instanceof Crud<?, ?>) {
        component =
            new CrudComponentDto(
                metadata,
                componentId,
                getComponentClassName(actualComponentInstance),
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    baseUrl,
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
                baseUrl,
                serverHttpRequest,
                allComponentsInStep,
                componentCounter,
                data);
        if (metadata instanceof TabLayoutDto tabLayout) {
          Map<String, String> componentIdPerTabId = new HashMap<>();
          for (int i = 0; i < tabLayout.tabs().size(); i++) {
            componentIdPerTabId.put(tabLayout.tabs().get(i).id(), childComponents.get(i));
          }
          metadata =
              new TabLayoutDto(
                  tabLayout.tabs().stream()
                      .map(
                          t -> new TabDto(componentIdPerTabId.get(t.id()), t.active(), t.caption()))
                      .toList());
        }
        component =
            new GenericComponentDto(
                metadata,
                componentId,
                getComponentClassName(actualComponentInstance),
                Map.of(),
                Map.of(),
                childComponents);
      } else {
        component =
            new GenericComponentDto(
                metadata,
                componentId,
                getComponentClassName(actualComponentInstance),
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    baseUrl,
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
            && (actualComponentInstance.getClass().isAnnotationPresent(HorizontallyArranged.class)
                || actualComponentInstance.getClass().isAnnotationPresent(VerticallyArranged.class)
                || actualComponentInstance.getClass().isAnnotationPresent(SplitArranged.class)))
        || (field != null
            && (field.isAnnotationPresent(HorizontallyArranged.class)
                || field.isAnnotationPresent(VerticallyArranged.class)
                || field.isAnnotationPresent(SplitArranged.class)
                || field.isAnnotationPresent(InTabsArranged.class)));
  }

  private List<String> getChildComponents(
      boolean form,
      Object actualComponentInstance,
      Field field,
      String baseUrl,
      ServerHttpRequest serverHttpRequest,
      Map<String, ComponentDto> allComponentsInStep,
      AtomicInteger componentCounter,
      Map<String, Object> data) {

    if (actualComponentInstance == null) {
      return List.of();
    }

    if (actualComponentInstance instanceof List<?> list) {
      return list.stream()
          .map(
              o ->
                  createComponent(
                      true,
                      o,
                      baseUrl,
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
            && (field.isAnnotationPresent(HorizontallyArranged.class)
                || field.isAnnotationPresent(VerticallyArranged.class)
                || field.isAnnotationPresent(SplitArranged.class)
                || field.isAnnotationPresent(InTabsArranged.class)))
        || (actualComponentInstance != null
            && (actualComponentInstance.getClass().isAnnotationPresent(HorizontallyArranged.class)
                || actualComponentInstance.getClass().isAnnotationPresent(VerticallyArranged.class)
                || actualComponentInstance.getClass().isAnnotationPresent(SplitArranged.class)
                || actualComponentInstance.getClass().isAnnotationPresent(InTabsArranged.class)))) {
      return reflectionService.getAllFields(actualComponentInstance.getClass()).stream()
          .map(f -> new Pair<>(f, getValue(f, actualComponentInstance)))
          .map(
              p ->
                  createComponent(
                      formIdentifier.isForm(p.getKey(), p.getValue()),
                      p.getValue(),
                      baseUrl,
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
    var value = reflectionService.getValue(f, actualComponentInstance);
    if (value == null) {
      value = reflectionService.newInstance(f.getType());
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
