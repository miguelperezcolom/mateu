package io.mateu.core.domain.model.outbound.modelToDtoMappers;

import io.mateu.core.domain.model.outbound.metadataBuilders.ComponentMetadataBuilder;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.viewMapperStuff.DataExtractor;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.ComponentId;
import io.mateu.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
public class ComponentFactory {

    private final ComponentMetadataBuilder componentMetadataBuilder;
    private final DataExtractor dataExtractor;
    private final ActualUiInstanceProvider actualUiInstanceProvider;

    public ComponentFactory(
            ComponentMetadataBuilder componentMetadataBuilder,
            DataExtractor dataExtractor,
            ActualUiInstanceProvider actualUiInstanceProvider
    ) {
        this.componentMetadataBuilder = componentMetadataBuilder;
        this.dataExtractor = dataExtractor;
        this.actualUiInstanceProvider = actualUiInstanceProvider;
    }


    public String createComponent(Object componentInstance, String stepId, Object uiInstance, JourneyContainer journeyContainer, ServerHttpRequest serverHttpRequest, Field field, List<Field> fields, Map<String, Component> allComponentsInStep) {
        String componentId = getComponentId(field);
        ComponentMetadata metadata =
                componentMetadataBuilder.getMetadata(
                        stepId, uiInstance, componentInstance, field, fields);
        var actualComponentInstance =
                actualUiInstanceProvider.getActualUiInstance(journeyContainer, stepId, componentInstance, serverHttpRequest);
        if (actualComponentInstance instanceof Crud<?,?>) {
            var component = new CrudComponent(
                    metadata,
                    componentId,
                    Map.of(),
                    dataExtractor.getData(componentInstance, actualComponentInstance),
                    getChildComponents(actualComponentInstance, stepId, field, uiInstance, journeyContainer, serverHttpRequest, allComponentsInStep),
                    Map.of(),
                    List.of()
            );
            allComponentsInStep.put(component.id(), component);
            return component.id();
        }
        var component = new GenericComponent(
                metadata,
                componentId,
                Map.of(),
                dataExtractor.getData(componentInstance, actualComponentInstance),
                getChildComponents(actualComponentInstance, stepId, field, uiInstance, journeyContainer, serverHttpRequest, allComponentsInStep));
        allComponentsInStep.put(component.id(), component);
        return component.id();
    }

    private List<String> getChildComponents(Object actualComponentInstance, String stepId, Field field, Object uiInstance, JourneyContainer journeyContainer, ServerHttpRequest serverHttpRequest, Map<String, Component> allComponentsInStep) {
        if (actualComponentInstance instanceof List<?> list) {
            return list.stream()
                    .map(o -> createComponent(o, stepId, uiInstance, journeyContainer, serverHttpRequest, field, List.of(), allComponentsInStep))
                    .toList();
        }
        return List.of();
    }

    private String getComponentId(Field field) {
        if (field != null && field.isAnnotationPresent(ComponentId.class)) {
            return field.getAnnotation(ComponentId.class).value();
        }
        return UUID.randomUUID().toString();
    }
}
