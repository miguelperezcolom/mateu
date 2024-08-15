package io.mateu.core.domain.model.inbound;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.inbound.persistence.Merger;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.StepMapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.annotations.ActionTarget;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.SortCriteria;
import io.mateu.dtos.Step;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class JourneyContainerService {

  private final StepMapper stepMapper;
  private final ActualValueExtractor actualValueExtractor;
  private final ApplicationContext applicationContext;
  private final Merger merger;
  private final JpaRpcCrudFactory jpaRpcCrudFactory;
  private final ReflectionHelper reflectionHelper;
  private final Serializer serializer;

  public Object getViewInstance(
      JourneyContainer journeyContainer, String stepId, ServerHttpRequest serverHttpRequest)
      throws Exception {
    Step step = journeyContainer.steps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id "
              + stepId
              + " for journey with id "
              + journeyContainer.journeyId()
              + " found");
    }
    Object viewInstance = reflectionHelper.newInstance(Class.forName(step.type()));
    Map<String, Object> data = step.data();
    if (viewInstance instanceof EntityEditor) {
      ((EntityEditor) viewInstance)
          .setEntityClass(Class.forName((String) data.get("__entityClassName__")));
      ((EntityEditor) viewInstance).setData(data);
    } else if (viewInstance instanceof ObjectEditor) {
      ((ObjectEditor) viewInstance)
          .setType(Class.forName((String) data.get("__entityClassName__")));
      ((ObjectEditor) viewInstance).setData(data);
    } else if (viewInstance instanceof FieldEditor) {
      ((FieldEditor) viewInstance).setType(Class.forName((String) data.get("__type__")));
      ((FieldEditor) viewInstance).setFieldId((String) data.get("__fieldId__"));
      ((FieldEditor) viewInstance).setInitialStep((String) data.get("__initialStep__"));
      ((FieldEditor) viewInstance).setData(data);
    } else {
      data.entrySet()
          .forEach(
              entry -> {
                try {
                  Object actualValue = actualValueExtractor.getActualValue(entry, viewInstance);
                  reflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                } catch (Exception ex) {
                  System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
              });
    }
    return viewInstance;
  }

  @Transactional
  public Listing getRpcViewInstance(
      JourneyContainer journeyContainer,
      String stepId,
      String listId,
      ServerHttpRequest serverHttpRequest)
      throws Exception {
    try {
      Object viewInstance = getViewInstance(journeyContainer, stepId, serverHttpRequest);
      if (viewInstance instanceof Listing) {
        return (Listing) viewInstance;
      }
      Object actualInstance = viewInstance;
      Listing rpcView = null;
      if (actualInstance instanceof EntityEditor) {
        EntityEditor entityEditor = (EntityEditor) actualInstance;
        actualInstance = merger.loadEntity(entityEditor.getData(), entityEditor.getEntityClass());
        Field listField = reflectionHelper.getFieldByName(actualInstance.getClass(), listId);
        if (listField != null) {
          return jpaRpcCrudFactory.create(actualInstance, listField);
        }
      } else if (actualInstance instanceof ObjectEditor) {
        ObjectEditor objectEditor = (ObjectEditor) actualInstance;
        Object instanceFromSpringContext = reflectionHelper.newInstance(objectEditor.getType());
        Object instanceWithDeserializedValues =
            serializer.fromJson(serializer.toJson(objectEditor.getData()), objectEditor.getType());
        reflectionHelper.copy(instanceWithDeserializedValues, instanceFromSpringContext);
        Field listField =
            reflectionHelper.getFieldByName(instanceFromSpringContext.getClass(), listId);
        if (listField != null) {
          return (Listing) reflectionHelper.getValue(listField, instanceFromSpringContext);
        }
      } else {
        return (Listing) reflectionHelper.getValue(listId, actualInstance);
      }
      Field listField = reflectionHelper.getFieldByName(actualInstance.getClass(), listId);
      if (listField != null) {
        rpcView = (Listing) reflectionHelper.newInstance(listField.getType());
        reflectionHelper.setValue(listId, actualInstance, rpcView);
      }
      return rpcView;
    } catch (Exception e) {
      log.warn(
          "on getRpcViewInstance for " + journeyContainer.journeyId() + " " + stepId + " " + listId,
          e);
    }
    return null;
  }

  public JourneyContainer updateStep(
      JourneyContainer journeyContainer,
      String stepId,
      Object editor,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Step oldStep = journeyContainer.steps().get(stepId);
    Step step =
        stepMapper.map(
            journeyContainer,
            stepId,
            oldStep.previousStepId(),
            editor,
            serverHttpRequest,
            oldStep.data());
    var steps = new HashMap<>(journeyContainer.steps());
    steps.put(stepId, step);
    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.remoteBaseUrl(),
        journeyContainer.journeyClass(),
        journeyContainer.journeyData(),
        journeyContainer.journey(),
        steps,
        steps.keySet().stream().toList(),
        journeyContainer.initialStep(),
        journeyContainer.lastUsedFilters(),
        journeyContainer.lastUsedSorting());
  }

  public JourneyContainer updateStep(
      JourneyContainer journeyContainer, Object editor, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    String stepId = journeyContainer.journey().currentStepId();
    return updateStep(journeyContainer, stepId, editor, serverHttpRequest);
  }

  public JourneyContainer updateStep(JourneyContainer journeyContainer, String stepId, Step step)
      throws Throwable {
    var steps = new HashMap<>(journeyContainer.steps());
    steps.put(stepId, step);
    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.remoteBaseUrl(),
        journeyContainer.journeyClass(),
        journeyContainer.journeyData(),
        journeyContainer.journey(),
        steps,
        journeyContainer.stepHistory(),
        journeyContainer.initialStep(),
        journeyContainer.lastUsedFilters(),
        journeyContainer.lastUsedSorting());
  }

  public JourneyContainer setStep(
      JourneyContainer journeyContainer,
      String stepId,
      Object editor,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return setStep(journeyContainer, stepId, editor, serverHttpRequest, ActionTarget.SameLane);
  }

  public JourneyContainer setStep(
      JourneyContainer journeyContainer,
      String stepId,
      Object editor,
      ServerHttpRequest serverHttpRequest,
      ActionTarget actionTarget)
      throws Throwable {
    String stepIdPrefix = journeyContainer.journey().currentStepId();
    if (stepIdPrefix == null) {
      stepIdPrefix = "";
    } else {
      stepIdPrefix = stepIdPrefix + "_";
    }
    if (stepIdPrefix.endsWith("view_")) {
      stepIdPrefix = stepIdPrefix.substring(0, "view_".length());
    }
    if (stepIdPrefix.endsWith("edit_")) {
      stepIdPrefix = stepIdPrefix.substring(0, "edit_".length());
    }
    String newStepId = stepIdPrefix + stepId;
    Step step =
        stepMapper.map(
            journeyContainer,
            newStepId,
            getPreviousStepId(newStepId, journeyContainer),
            editor,
            serverHttpRequest,
            null);
    if (actionTarget != null) {
      step =
          new Step(
              step.id(),
              step.name(),
              step.type(),
              step.view(),
              step.data(),
              step.rules(),
              step.previousStepId(),
              actionTarget.name());
    }
    var steps = new HashMap<>(journeyContainer.steps());
    steps.put(newStepId, step);
    var journey = journeyContainer.journey();
    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.remoteBaseUrl(),
        journeyContainer.journeyClass(),
        journeyContainer.journeyData(),
        new Journey(
            journey.type(),
            journey.status(),
            journey.statusMessage(),
            newStepId,
            editor.getClass().getName()),
        steps,
            Stream.concat(journeyContainer.stepHistory().stream(), Stream.of(newStepId)).distinct().toList(),
        journeyContainer.initialStep(),
        journeyContainer.lastUsedFilters(),
        journeyContainer.lastUsedSorting());
  }

  private String getPreviousStepId(String targetStepId, JourneyContainer journeyContainer) {
    String currentStepId = journeyContainer.journey().currentStepId();
    if (targetStepId.equals(currentStepId)) {
      return journeyContainer.steps().get(currentStepId).previousStepId();
    }
    return currentStepId;
  }

  private String getCurrentStepId(JourneyContainer journeyContainer) {
    return journeyContainer.journey().currentStepId();
  }

  private Map<String, Step> extendMap(Map<String, Step> steps, String stepId, Step step) {
    Map extended = new HashMap();
    extended.putAll(steps);
    extended.put(stepId, step);
    return extended;
  }

  public JourneyContainer backToStep(JourneyContainer journeyContainer, String stepId)
      throws Exception {
    Step step = journeyContainer.steps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id "
              + stepId
              + " for journey with id "
              + journeyContainer.journeyId()
              + " found");
    }
    var journey = journeyContainer.journey();
    var stepsToRemove = journeyContainer.stepHistory().stream().skip(journeyContainer.stepHistory().indexOf(stepId) + 1).toList();

    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.remoteBaseUrl(),
        journeyContainer.journeyClass(),
        journeyContainer.journeyData(),
        new Journey(journey.type(), journey.status(), journey.statusMessage(), stepId, step.type()),
            journeyContainer.steps().entrySet().stream()
                    .filter(e -> !stepsToRemove.contains(e.getKey()))
                    .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue())),
            journeyContainer.stepHistory().stream().filter(v -> stepsToRemove.contains(v)).toList(),
        journeyContainer.initialStep(),
        journeyContainer.lastUsedFilters(),
        journeyContainer.lastUsedSorting());
  }

  public void back(JourneyContainer journeyContainer) throws Exception {
    var previousStepId = getPreviousStepId(getCurrentStepId(journeyContainer), journeyContainer);
    backToStep(journeyContainer, previousStepId);
  }

  public JourneyContainer setAsCurrentStep(JourneyContainer journeyContainer, String stepId)
      throws Exception {
    Step step = journeyContainer.steps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id " + stepId + " found for journey " + journeyContainer.journeyId());
    }
    var journey = journeyContainer.journey();
    var stepsToRemove = journeyContainer.stepHistory().stream().skip(journeyContainer.stepHistory().indexOf(stepId) + 1).toList();

    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.remoteBaseUrl(),
        journeyContainer.journeyClass(),
        journeyContainer.journeyData(),
        new Journey(journey.type(), journey.status(), journey.statusMessage(), stepId, step.type()),
            journeyContainer.steps().entrySet().stream()
                    .filter(e -> !stepsToRemove.contains(e.getKey()))
                    .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue())),
            journeyContainer.stepHistory().stream().filter(v -> stepsToRemove.contains(v)).toList(),
        journeyContainer.initialStep(),
        journeyContainer.lastUsedFilters(),
        journeyContainer.lastUsedSorting());
  }

  public Step readStep(JourneyContainer journeyContainer, String stepId) throws Exception {
    Step step = journeyContainer.steps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id " + stepId + " found for journey " + journeyContainer.journeyId());
    }
    return step;
  }

  public Step getInitialStep(JourneyContainer journeyContainer) throws Exception {
    return journeyContainer.initialStep();
  }

  public Step getCurrentStep(JourneyContainer journeyContainer) throws Exception {
    String currentStepId = journeyContainer.journey().currentStepId();
    return journeyContainer.steps().get(currentStepId);
  }

  public ApplicationContext getApplicationContext() {
    return applicationContext;
  }

  public Object getLastUsedFilters(
      JourneyContainer journeyContainer, String stepId, String listId) {
    return journeyContainer.lastUsedFilters().get(stepId + "#" + listId);
  }

  public List<SortCriteria> getLastUsedOrders(
      JourneyContainer journeyContainer, String stepId, String listId) {
    return journeyContainer.lastUsedSorting().get(stepId + "#" + listId);
  }

  public JourneyContainer deleteHistory(JourneyContainer journeyContainer) {
    Map<String, Step> steps = new HashMap<>();
    var step = journeyContainer.steps().get(journeyContainer.journey().currentStepId());
    steps.put(
        journeyContainer.journey().currentStepId(),
        new Step(
            step.id(),
            step.name(),
            step.type(),
            step.view(),
            step.data(),
            step.rules(),
            null,
            step.target()));
    return new JourneyContainer(
        journeyContainer.journeyId(),
        journeyContainer.journeyTypeId(),
        journeyContainer.remoteBaseUrl(),
        journeyContainer.journeyClass(),
        journeyContainer.journeyData(),
        journeyContainer.journey(),
        steps,
        List.of(step.id()),
        step,
        journeyContainer.lastUsedFilters(),
        journeyContainer.lastUsedSorting());
  }
}
