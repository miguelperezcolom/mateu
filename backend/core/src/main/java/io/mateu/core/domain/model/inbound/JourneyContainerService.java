package io.mateu.core.domain.model.inbound;

import io.mateu.core.domain.commands.runStepAction.ActualValueExtractor;
import io.mateu.core.domain.model.inbound.editors.EntityEditor;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.inbound.editors.ObjectEditor;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.StepMapper;
import io.mateu.core.domain.model.outbound.persistence.Merger;
import io.mateu.core.domain.model.reflection.Field;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.JpaRpcCrudFactory;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.SortCriteria;
import io.mateu.dtos.Step;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
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
    Step step = journeyContainer.getSteps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id "
              + stepId
              + " for journey with id "
              + journeyContainer.getJourneyId()
              + " found");
    }
    Object viewInstance = reflectionHelper.newInstance(Class.forName(step.getType()));
    Map<String, Object> data = step.getData();
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
        Field listField =
            reflectionHelper.getFieldByName(actualInstance.getClass(), listId);
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
      Field listField =
          reflectionHelper.getFieldByName(actualInstance.getClass(), listId);
      if (listField != null) {
        rpcView = (Listing) reflectionHelper.newInstance(listField.getType());
        reflectionHelper.setValue(listId, actualInstance, rpcView);
      }
      return rpcView;
    } catch (Exception e) {
      log.warn(
          "on getRpcViewInstance for "
              + journeyContainer.getJourneyId()
              + " "
              + stepId
              + " "
              + listId,
          e);
    }
    return null;
  }

  public void updateStep(
      JourneyContainer journeyContainer,
      String stepId,
      Object editor,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Step oldStep = journeyContainer.getSteps().get(stepId);
    Step step =
        stepMapper.map(
            journeyContainer, stepId, oldStep.getPreviousStepId(), editor, serverHttpRequest);
    if (oldStep != null) {
      var data = oldStep.getData();
      data.putAll(step.getData());
      step.setData(data);
    }
    if (!journeyContainer.getSteps().containsKey(stepId)) {
      journeyContainer.setSteps(extendMap(journeyContainer.getSteps(), stepId, step));
    } else {
      HashMap<String, Step> modifiableMap = new HashMap<>(journeyContainer.getSteps());
      modifiableMap.put(stepId, step);
      journeyContainer.setSteps(modifiableMap);
    }
  }

  public void updateStep(
      JourneyContainer journeyContainer, Object editor, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    String stepId = journeyContainer.getJourney().getCurrentStepId();
    updateStep(journeyContainer, stepId, editor, serverHttpRequest);
  }

  public void updateStep(JourneyContainer journeyContainer, String stepId, Step step)
      throws Throwable {
    if (!journeyContainer.getSteps().containsKey(stepId)) {
      journeyContainer.setSteps(extendMap(journeyContainer.getSteps(), stepId, step));
    } else {
      HashMap<String, Step> modifiableMap = new HashMap<>(journeyContainer.getSteps());
      modifiableMap.put(stepId, step);
      journeyContainer.setSteps(modifiableMap);
    }
  }

  public void setStep(
      JourneyContainer journeyContainer,
      String stepId,
      Object editor,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    String stepIdPrefix = journeyContainer.getJourney().getCurrentStepId();
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
            serverHttpRequest);
    if (!journeyContainer.getSteps().containsKey(newStepId)) {
      journeyContainer.setSteps(extendMap(journeyContainer.getSteps(), newStepId, step));
    } else {
      HashMap<String, Step> modifiableMap = new HashMap<>(journeyContainer.getSteps());
      modifiableMap.put(newStepId, step);
      journeyContainer.setSteps(modifiableMap);
    }
    journeyContainer.getJourney().setCurrentStepId(newStepId);
    journeyContainer.getJourney().setCurrentStepDefinitionId(editor.getClass().getName());
  }

  private String getPreviousStepId(String targetStepId, JourneyContainer journeyContainer) {
    String currentStepId = journeyContainer.getJourney().getCurrentStepId();
    if (targetStepId.equals(currentStepId)) {
      return journeyContainer.getSteps().get(currentStepId).getPreviousStepId();
    }
    return currentStepId;
  }

  private String getCurrentStepId(JourneyContainer journeyContainer) {
    return journeyContainer.getJourney().getCurrentStepId();
  }

  private Map<String, Step> extendMap(Map<String, Step> steps, String stepId, Step step) {
    Map extended = new HashMap();
    extended.putAll(steps);
    extended.put(stepId, step);
    return extended;
  }

  public void backToStep(JourneyContainer journeyContainer, String stepId) throws Exception {
    Step step = journeyContainer.getSteps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id "
              + stepId
              + " for journey with id "
              + journeyContainer.getJourneyId()
              + " found");
    }
    journeyContainer.getJourney().setCurrentStepId(stepId);
    journeyContainer.getJourney().setCurrentStepDefinitionId(step.getType());
  }

  public void back(JourneyContainer journeyContainer) throws Exception {
    var previousStepId = getPreviousStepId(getCurrentStepId(journeyContainer), journeyContainer);
    backToStep(journeyContainer, previousStepId);
  }

  public Step getStep(JourneyContainer journeyContainer, String stepId) throws Exception {
    Step step = journeyContainer.getSteps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id " + stepId + " found for journey " + journeyContainer.getJourneyId());
    }
    journeyContainer.getJourney().setCurrentStepDefinitionId(step.getType());
    journeyContainer.getJourney().setCurrentStepId(stepId);
    return step;
  }

  public Step readStep(JourneyContainer journeyContainer, String stepId) throws Exception {
    Step step = journeyContainer.getSteps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id " + stepId + " found for journey " + journeyContainer.getJourneyId());
    }
    return step;
  }

  public Step getInitialStep(JourneyContainer journeyContainer) throws Exception {
    return journeyContainer.getInitialStep();
  }

  public Step getCurrentStep(JourneyContainer journeyContainer) throws Exception {
    String currentStepId = journeyContainer.getJourney().getCurrentStepId();
    return journeyContainer.getSteps().get(currentStepId);
  }

  public ApplicationContext getApplicationContext() {
    return applicationContext;
  }

  public Object getLastUsedFilters(
      JourneyContainer journeyContainer, String stepId, String listId) {
    return journeyContainer.getLastUsedFilters().get(stepId + "#" + listId);
  }

  public List<SortCriteria> getLastUsedOrders(
      JourneyContainer journeyContainer, String stepId, String listId) {
    return journeyContainer.getLastUsedSorting().get(stepId + "#" + listId);
  }

  public void saveFilters(
      JourneyContainer journeyContainer, String stepId, String listId, Object filters) {
    journeyContainer.getLastUsedFilters().put(stepId + "#" + listId, filters);
  }

  public void saveOrders(
      JourneyContainer journeyContainer, String stepId, String listId, List<SortCriteria> sorting) {
    journeyContainer.getLastUsedSorting().put(stepId + "#" + listId, sorting);
  }
}
