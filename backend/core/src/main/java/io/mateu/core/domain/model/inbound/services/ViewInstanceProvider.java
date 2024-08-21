package io.mateu.core.domain.model.inbound.services;

import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.dtos.Component;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Pair;
import io.mateu.dtos.Step;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.stream.Stream;

@Service
public class ViewInstanceProvider {

    private final ReflectionHelper reflectionHelper;
    private final ActualValueExtractor actualValueExtractor;

    public ViewInstanceProvider(ReflectionHelper reflectionHelper, ActualValueExtractor actualValueExtractor) {
        this.reflectionHelper = reflectionHelper;
        this.actualValueExtractor = actualValueExtractor;
    }

    public Object getViewInstance(
            JourneyContainer journeyContainer, String stepId, ServerHttpRequest serverHttpRequest)
            throws Exception {
        // get step
        Step step = getStep(journeyContainer, stepId);

        // instantiate object for step
        Object viewInstance = reflectionHelper.newInstance(Class.forName(step.type()));

        // fill with data
        fillWithData(step, viewInstance);

        // return filled object instance
        return viewInstance;

    }

    private void fillWithData(Step step, Object viewInstance) throws ClassNotFoundException {
        Stream.concat(
                Stream.concat(
                Stream.concat(step.view().header().components().stream(),
                step.view().left().components().stream()),
                Stream.concat(step.view().main().components().stream(),
                step.view().right().components().stream())),
                step.view().footer().components().stream()
        )
                .map(c -> new Object[] {c.data(), getViewPart(viewInstance, c)})
                .forEach(p -> applyData((Map<String, Object>) p[0], p[1]));
    }

    @SneakyThrows
    private void applyData(Map<String, Object> data, Object instance) {
        if (instance instanceof EntityEditor entityEditor) {
            entityEditor.setEntityClass(Class.forName((String) data.get("__entityClassName__")));
            entityEditor.setData(data);
        } else if (instance instanceof ObjectEditor objectEditor) {
            objectEditor.setType(Class.forName((String) data.get("__entityClassName__")));
            objectEditor.setData(data);
        } else if (instance instanceof FieldEditor fieldEditor) {
            fieldEditor.setType(Class.forName((String) data.get("__type__")));
            fieldEditor.setFieldId((String) data.get("__fieldId__"));
            fieldEditor.setInitialStep((String) data.get("__initialStep__"));
            fieldEditor.setData(data);
        } else {
            data.entrySet()
                    .forEach(
                            entry -> {
                                try {
                                    Object actualValue = actualValueExtractor.getActualValue(entry, instance);
                                    reflectionHelper.setValue(entry.getKey(), instance, actualValue);
                                } catch (Exception ex) {
                                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                                }
                            });
        }

    }

    @SneakyThrows
    private Object getViewPart(Object viewInstance, Component c) {
        if (c.id().equals("___self___")) {
            return viewInstance;
        }
        var field = reflectionHelper.getFieldByName(viewInstance.getClass(), c.id());
        Object instance = reflectionHelper.getValue(field, viewInstance);
        if (instance == null) {
            instance = reflectionHelper.newInstance(field.getType());
        }
        return instance;
    }

    private static Step getStep(JourneyContainer journeyContainer, String stepId) throws Exception {
        Step step = journeyContainer.steps().get(stepId);
        if (step == null) {
            throw new Exception(
                    "No step with id "
                            + stepId
                            + " for journey with id "
                            + journeyContainer.journeyId()
                            + " found");
        }
        return step;
    }

}
