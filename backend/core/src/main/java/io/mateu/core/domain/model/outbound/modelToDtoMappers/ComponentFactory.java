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
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import io.mateu.dtos.*;
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
      Object componentInstance, ServerHttpRequest serverHttpRequest) {
    ComponentMetadata metadata = componentMetadataBuilder.getFormMetadata(componentInstance);
    return new GenericComponent(
        metadata,
        UUID.randomUUID().toString(),
        componentInstance.getClass().getName(),
        Map.of(),
        dataExtractor.getData(componentInstance),
        List.of());
  }

  public String createComponent(
      boolean form,
      Object componentInstance,
      ServerHttpRequest serverHttpRequest,
      Field field,
      List<Field> fields,
      Map<String, Component> allComponentsInStep,
      AtomicInteger componentCounter) {
    String componentId = getComponentId(field, componentCounter);
    ComponentMetadata metadata =
        componentMetadataBuilder.getMetadata(form, componentInstance, field, fields);
    var actualComponentInstance =
        actualUiInstanceProvider.getActualUiInstance(componentInstance, serverHttpRequest);
    Component component;
    if (form) {
      component =
          new GenericComponent(
              metadata,
              componentId,
              componentInstance.getClass().getName(),
              Map.of(),
              dataExtractor.getData(componentInstance, actualComponentInstance),
              getChildComponents(
                  form,
                  actualComponentInstance,
                  field,
                  serverHttpRequest,
                  allComponentsInStep,
                  componentCounter));
    } else {
      if (actualComponentInstance instanceof Crud<?, ?>) {
        component =
            new CrudComponent(
                metadata,
                componentId,
                actualComponentInstance.getClass().getName(),
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    serverHttpRequest,
                    allComponentsInStep,
                    componentCounter),
                Map.of(),
                List.of());
      } else if (isLayout(field, actualComponentInstance)) {
        component =
            new GenericComponent(
                metadata,
                componentId,
                actualComponentInstance.getClass().getName(),
                Map.of(),
                Map.of(),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    serverHttpRequest,
                    allComponentsInStep,
                    componentCounter));
      } else {
        component =
            new GenericComponent(
                metadata,
                componentId,
                actualComponentInstance.getClass().getName(),
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(
                    form,
                    actualComponentInstance,
                    field,
                    serverHttpRequest,
                    allComponentsInStep,
                    componentCounter));
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
                || field.isAnnotationPresent(SplitLayout.class)));
  }

  private List<String> getChildComponents(
      boolean form,
      Object actualComponentInstance,
      Field field,
      ServerHttpRequest serverHttpRequest,
      Map<String, Component> allComponentsInStep,
      AtomicInteger componentCounter) {
    if (actualComponentInstance instanceof List<?> list) {
      return list.stream()
          .map(
              o ->
                  createComponent(
                      form,
                      o,
                      serverHttpRequest,
                      null,
                      List.of(),
                      allComponentsInStep,
                      componentCounter))
          .toList();
    }
    if (actualComponentInstance instanceof Container
        || (field != null
            && (field.isAnnotationPresent(HorizontalLayout.class)
                || field.isAnnotationPresent(VerticalLayout.class)
                || field.isAnnotationPresent(SplitLayout.class)))
        || (actualComponentInstance != null
            && (actualComponentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(VerticalLayout.class)
                || actualComponentInstance.getClass().isAnnotationPresent(SplitLayout.class)))) {
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
                      componentCounter))
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

  private String getComponentId(Field field, AtomicInteger componentCounter) {
    if (field != null && field.isAnnotationPresent(ComponentId.class)) {
      return field.getAnnotation(ComponentId.class).value();
    }
    return "component-" + componentCounter.getAndIncrement();
  }
}
