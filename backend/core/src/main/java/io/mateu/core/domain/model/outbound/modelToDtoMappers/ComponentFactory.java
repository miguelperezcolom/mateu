package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.core.domain.model.outbound.metadataBuilders.ComponentMetadataBuilder;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.data.Pair;
import io.mateu.core.domain.uidefinition.core.interfaces.Card;
import io.mateu.core.domain.uidefinition.core.interfaces.Container;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.ComponentId;
import io.mateu.core.domain.uidefinition.shared.annotations.HorizontalLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.SplitLayout;
import io.mateu.core.domain.uidefinition.shared.annotations.VerticalLayout;
import io.mateu.core.domain.uidefinition.shared.data.Stepper;
import io.mateu.dtos.*;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.lang.reflect.InvocationTargetException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@Service
public class ComponentFactory {

    private final ComponentMetadataBuilder componentMetadataBuilder;
    private final DataExtractor dataExtractor;
    private final ActualUiInstanceProvider actualUiInstanceProvider;
    private final ReflectionHelper reflectionHelper;
    private final FormIdentifier formIdentifier;

    public ComponentFactory(
            ComponentMetadataBuilder componentMetadataBuilder,
            DataExtractor dataExtractor,
            ActualUiInstanceProvider actualUiInstanceProvider, ReflectionHelper reflectionHelper, FormIdentifier formIdentifier) {
        this.componentMetadataBuilder = componentMetadataBuilder;
        this.dataExtractor = dataExtractor;
        this.actualUiInstanceProvider = actualUiInstanceProvider;
        this.reflectionHelper = reflectionHelper;
        this.formIdentifier = formIdentifier;
    }


    public String createComponent(boolean form, Object componentInstance, String stepId, JourneyContainer journeyContainer, ServerHttpRequest serverHttpRequest, Field field, List<Field> fields, Map<String, Component> allComponentsInStep, AtomicInteger componentCounter) {
        String componentId = getComponentId(field, componentCounter);
        ComponentMetadata metadata =
                componentMetadataBuilder.getMetadata(form, stepId, componentInstance, field, fields);
        var actualComponentInstance =
                actualUiInstanceProvider.getActualUiInstance(journeyContainer, stepId, componentInstance, serverHttpRequest);
        Component component;
        if (form) {
            component = new GenericComponent(
                    metadata,
                    componentId,
                    componentInstance.getClass().getName(),
                    Map.of(),
                    dataExtractor.getData(componentInstance, actualComponentInstance),
                    getChildComponents(form, actualComponentInstance, stepId, field,journeyContainer, serverHttpRequest, allComponentsInStep, componentCounter));
        } else {
            if (actualComponentInstance instanceof Crud<?,?>) {
                component = new CrudComponent(
                        metadata,
                        componentId,
                        actualComponentInstance.getClass().getName(),
                        Map.of(),
                        dataExtractor.getData(componentInstance, actualComponentInstance),
                        getChildComponents(form, actualComponentInstance, stepId, field, journeyContainer, serverHttpRequest, allComponentsInStep, componentCounter),
                        Map.of(),
                        List.of()
                );
            } else if ((actualComponentInstance != null && (actualComponentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)
                    || actualComponentInstance.getClass().isAnnotationPresent(VerticalLayout.class)
                    || actualComponentInstance.getClass().isAnnotationPresent(SplitLayout.class)))
                    || (field != null
                        && (field.isAnnotationPresent(HorizontalLayout.class)
                            || field.isAnnotationPresent(VerticalLayout.class)
                            || field.isAnnotationPresent(SplitLayout.class)))) {
                component = new GenericComponent(
                        metadata,
                        componentId,
                        actualComponentInstance.getClass().getName(),
                        Map.of(),
                        Map.of(),
                        getChildComponents(form, actualComponentInstance, stepId, field, journeyContainer, serverHttpRequest, allComponentsInStep, componentCounter));
            } else {
                component = new GenericComponent(
                        metadata,
                        componentId,
                        actualComponentInstance.getClass().getName(),
                        Map.of(),
                        dataExtractor.getData(componentInstance, actualComponentInstance),
                        getChildComponents(form, actualComponentInstance, stepId, field,journeyContainer, serverHttpRequest, allComponentsInStep, componentCounter));
            }
        }
        allComponentsInStep.put(component.id(), component);
        return component.id();
    }

    private List<String> getChildComponents(boolean form, Object actualComponentInstance, String stepId, Field field, JourneyContainer journeyContainer, ServerHttpRequest serverHttpRequest, Map<String, Component> allComponentsInStep, AtomicInteger componentCounter) {
        if (actualComponentInstance instanceof List<?> list) {
            return list.stream()
                    .map(o -> createComponent(form, o, stepId, journeyContainer, serverHttpRequest, null, List.of(), allComponentsInStep, componentCounter))
                    .toList();
        }
        if (actualComponentInstance instanceof Container
                || (field != null && (
                    field.isAnnotationPresent(HorizontalLayout.class)
                    || field.isAnnotationPresent(VerticalLayout.class)
                    || field.isAnnotationPresent(SplitLayout.class)
                ))
                || (
                        actualComponentInstance != null && (
                                actualComponentInstance.getClass().isAnnotationPresent(HorizontalLayout.class)
                                || actualComponentInstance.getClass().isAnnotationPresent(VerticalLayout.class)
                                || actualComponentInstance.getClass().isAnnotationPresent(SplitLayout.class)
                                )
                )
        ) {
            return reflectionHelper.getAllFields(actualComponentInstance.getClass()).stream()
                    .map(f -> new Pair<>(f, getValue(f, actualComponentInstance)))
                    .map(p -> createComponent(formIdentifier.isForm(p.getKey(), p.getValue()), p.getValue(), stepId, journeyContainer, serverHttpRequest, p.getKey(), List.of(), allComponentsInStep, componentCounter))
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
