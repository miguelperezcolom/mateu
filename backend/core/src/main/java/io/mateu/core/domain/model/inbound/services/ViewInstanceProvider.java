package io.mateu.core.domain.model.inbound.services;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.dtos.Component;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import java.util.Map;
import java.util.stream.Stream;
import lombok.SneakyThrows;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class ViewInstanceProvider {

  private final ReflectionHelper reflectionHelper;
  private final ActualValueExtractor actualValueExtractor;

  public ViewInstanceProvider(
      ReflectionHelper reflectionHelper, ActualValueExtractor actualValueExtractor) {
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
                Stream.concat(
                    step.view().header().componentIds().stream(),
                    step.view().left().componentIds().stream()),
                Stream.concat(
                    step.view().main().componentIds().stream(),
                    step.view().right().componentIds().stream())),
            step.view().footer().componentIds().stream())
        .map(
            c ->
                new Object[] {
                  step.components().get(c), getViewPart(viewInstance, step.components().get(c))
                })
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
