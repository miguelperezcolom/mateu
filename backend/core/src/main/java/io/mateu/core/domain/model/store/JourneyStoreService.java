package io.mateu.core.domain.model.store;

import io.mateu.core.domain.commands.runStep.ActualValueExtractor;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.modelToDtoMappers.StepMapper;
import io.mateu.core.domain.model.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.model.persistence.Merger;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.JpaRpcCrudFactory;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class JourneyStoreService {

  @Autowired private StepMapper stepMapper;

  @Autowired private UIMapper uiMapper;

  @Autowired private JourneyRepository journeyRepo;

  @Autowired private ActualValueExtractor actualValueExtractor;

  @Autowired private ApplicationContext applicationContext;

  @Autowired private Merger merger;

  @Autowired private JpaRpcCrudFactory jpaRpcCrudFactory;

  public Object getViewInstance(
      String journeyId, String stepId, ServerHttpRequest serverHttpRequest) throws Exception {
    Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    Step step = container.get().getSteps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id " + stepId + " for journey with id " + journeyId + " found");
    }
    if (false && "io.mateu.mdd.ui.cruds.JpaRpcCrudView".equals(step.getType())) {
      Object jpaRpcCrudView =
          createInstanceFromJourneyTypeId(container.get().getJourneyTypeId(), serverHttpRequest);
      return jpaRpcCrudView;
    } else {
      Object viewInstance = ReflectionHelper.newInstance(Class.forName(step.getType()));
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
                    ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                  } catch (Exception ex) {
                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                  }
                });
      }
      return viewInstance;
    }
  }

  @Transactional
  public Listing getRpcViewInstance(
      String journeyId, String stepId, String listId, ServerHttpRequest serverHttpRequest)
      throws Exception {
    try {
      Object viewInstance = getViewInstance(journeyId, stepId, serverHttpRequest);
      if (viewInstance instanceof Listing) {
        return (Listing) viewInstance;
      }
      Object actualInstance = viewInstance;
      Listing rpcView = null;
      if (actualInstance instanceof EntityEditor) {
        EntityEditor entityEditor = (EntityEditor) actualInstance;
        actualInstance = merger.loadEntity(entityEditor.getData(), entityEditor.getEntityClass());
        FieldInterfaced listField =
            ReflectionHelper.getFieldByName(actualInstance.getClass(), listId);
        if (listField != null) {
          return jpaRpcCrudFactory.create(actualInstance, listField);
        }
      } else if (actualInstance instanceof ObjectEditor) {
        ObjectEditor objectEditor = (ObjectEditor) actualInstance;
        Object instanceFromSpringContext = ReflectionHelper.newInstance(objectEditor.getType());
        Object instanceWithDeserializedValues =
            Helper.fromJson(Helper.toJson(objectEditor.getData()), objectEditor.getType());
        ReflectionHelper.copy(instanceWithDeserializedValues, instanceFromSpringContext);
        FieldInterfaced listField =
            ReflectionHelper.getFieldByName(instanceFromSpringContext.getClass(), listId);
        if (listField != null) {
          return (Listing) ReflectionHelper.getValue(listField, instanceFromSpringContext);
        }
      } else {
        return (Listing) ReflectionHelper.getValue(listId, actualInstance);
      }
      FieldInterfaced listField =
          ReflectionHelper.getFieldByName(actualInstance.getClass(), listId);
      if (listField != null) {
        rpcView = (Listing) ReflectionHelper.newInstance(listField.getType());
        ReflectionHelper.setValue(listId, actualInstance, rpcView);
      }
      return rpcView;
    } catch (Exception e) {
      log.warn("on getRpcViewInstance for " + journeyId + " " + stepId + " " + listId, e);
    }
    return null;
  }

  public Optional<JourneyContainer> findJourneyById(String journeyId) {
    return journeyRepo.findById(journeyId);
  }

  public void save(JourneyContainer journeyContainer) {
    journeyContainer.setLastAccess(LocalDateTime.now());
    journeyRepo.save(journeyContainer);
  }

  public void updateStep(
      String journeyId, String stepId, Object editor, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    Step oldStep = container.get().getSteps().get(stepId);
    Step step =
        stepMapper.map(
            container.get(), stepId, oldStep.getPreviousStepId(), editor, serverHttpRequest);
    if (oldStep != null) {
      var data = oldStep.getData();
      data.putAll(step.getData());
      step.setData(data);
    }
    if (!container.get().getSteps().containsKey(stepId)) {
      container.get().setSteps(extendMap(container.get().getSteps(), stepId, step));
    } else {
      HashMap<String, Step> modifiableMap = new HashMap<>(container.get().getSteps());
      modifiableMap.put(stepId, step);
      container.get().setSteps(modifiableMap);
    }
    container.get().setLastAccess(LocalDateTime.now());
    journeyRepo.save(container.get());
  }

  public void updateStep(String journeyId, Object editor, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    String stepId = container.get().getJourney().getCurrentStepId();
    updateStep(journeyId, stepId, editor, serverHttpRequest);
  }

  public void updateStep(String journeyId, String stepId, Step step) throws Throwable {
    Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    if (!container.get().getSteps().containsKey(stepId)) {
      container.get().setSteps(extendMap(container.get().getSteps(), stepId, step));
    } else {
      HashMap<String, Step> modifiableMap = new HashMap<>(container.get().getSteps());
      modifiableMap.put(stepId, step);
      container.get().setSteps(modifiableMap);
    }
    container.get().setLastAccess(LocalDateTime.now());
    journeyRepo.save(container.get());
  }

  public void setStep(
      String journeyId, String stepId, Object editor, ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    String stepIdPrefix = container.get().getJourney().getCurrentStepId();
    if (stepIdPrefix == null) {
      stepIdPrefix = "";
    } else {
      stepIdPrefix = stepIdPrefix + "_";
    }
    String newStepId = stepIdPrefix + stepId;
    Step step =
        stepMapper.map(
            container.get(),
            newStepId,
            getPreviousStepId(newStepId, container),
            editor,
            serverHttpRequest);
    if (!container.get().getSteps().containsKey(newStepId)) {
      container.get().setSteps(extendMap(container.get().getSteps(), newStepId, step));
    } else {
      HashMap<String, Step> modifiableMap = new HashMap<>(container.get().getSteps());
      modifiableMap.put(newStepId, step);
      container.get().setSteps(modifiableMap);
    }
    container.get().getJourney().setCurrentStepId(newStepId);
    container.get().getJourney().setCurrentStepDefinitionId(editor.getClass().getName());
    container.get().setLastAccess(LocalDateTime.now());
    journeyRepo.save(container.get());
  }

  private String getPreviousStepId(String targetStepId, Optional<JourneyContainer> container) {
    if (container.isEmpty()) {
      return null;
    }
    String currentStepId = container.get().getJourney().getCurrentStepId();
    if (targetStepId.equals(currentStepId)) {
      return null;
    }
    return currentStepId;
  }

  private String getCurrentStepId(Optional<JourneyContainer> container) {
    if (container.isEmpty()) {
      return null;
    }
    return container.get().getJourney().getCurrentStepId();
  }

  private Map<String, Step> extendMap(Map<String, Step> steps, String stepId, Step step) {
    Map extended = new HashMap();
    extended.putAll(steps);
    extended.put(stepId, step);
    return extended;
  }

  public Journey getJourney(String journeyId) throws Exception {
    Optional<JourneyContainer> container = findJourneyById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    return container.get().getJourney();
  }

  public void backToStep(String journeyId, String stepId) throws Exception {
    Optional<JourneyContainer> container = findJourneyById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    Step step = container.get().getSteps().get(stepId);
    if (step == null) {
      throw new Exception(
          "No step with id " + stepId + " for journey with id " + journeyId + " found");
    }
    container.get().getJourney().setCurrentStepId(stepId);
    container.get().getJourney().setCurrentStepDefinitionId(step.getType());
    container.get().setLastAccess(LocalDateTime.now());
    journeyRepo.save(container.get());
  }

  public boolean isCrud(String journeyId) throws Exception {
    Optional<JourneyContainer> container = findJourneyById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    return "list".equals(container.get().getInitialStep());
  }

  public Step getStep(String journeyId, String stepId) throws Exception {
    Optional<JourneyContainer> container = findJourneyById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    Step step = container.get().getSteps().get(stepId);
    if (step == null) {
      throw new Exception("No step with id " + journeyId + " found for journey " + journeyId);
    }
    container.get().getJourney().setCurrentStepDefinitionId(step.getType());
    container.get().getJourney().setCurrentStepId(stepId);
    container.get().setLastAccess(LocalDateTime.now());
    journeyRepo.save(container.get());
    return step;
  }

  public Step getInitialStep(String journeyId) throws Exception {
    Optional<JourneyContainer> container = findJourneyById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    return container.get().getInitialStep();
  }

  public Step getCurrentStep(String journeyId) throws Exception {
    Optional<JourneyContainer> container = findJourneyById(journeyId);
    if (!container.isPresent()) {
      throw new Exception("No journey with id " + journeyId + " found");
    }
    String currentStepId = container.get().getJourney().getCurrentStepId();
    return container.get().getSteps().get(currentStepId);
  }

  @Autowired private MenuToBeanMappingRepository menuMappingRepo;

  public void storeMenuAction(String actionId, Object bean) {
    menuMappingRepo.save(MenuToBeanMapping.builder().actionId(actionId).bean(bean).build());
  }

  public MenuToBeanMapping getMenuMapping(String actionId, ServerHttpRequest serverHttpRequest) {
    Optional<MenuToBeanMapping> menuToBeanMapping = menuMappingRepo.findById(actionId);
    if (menuToBeanMapping.isEmpty()) {
      if (actionId.contains("_")) { // it's a ui
        String uiClassName = actionId.split("_")[1];
        Object uiInstance = null;
        try {
          uiInstance = ReflectionHelper.newInstance(Class.forName(uiClassName));
          uiMapper.map(uiInstance, serverHttpRequest);
          menuToBeanMapping = menuMappingRepo.findById(actionId);
        } catch (Exception e) {
          e.printStackTrace();
        }
      } else { // it's a form
        String uiClassName = actionId;
        Object uiInstance = null;
        try {
          // todo: refactor for improving
          uiInstance = ReflectionHelper.newInstance(Class.forName(uiClassName));
          uiMapper.map(uiInstance, serverHttpRequest);
          storeMenuAction(actionId, new MDDOpenEditorAction("", uiInstance));
          menuToBeanMapping = menuMappingRepo.findById(actionId);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    }
    return menuToBeanMapping.orElse(null);
  }

  public Object createInstanceFromJourneyTypeId(
      String journeyTypeId, ServerHttpRequest serverHttpRequest) {
    MenuToBeanMapping menuMapping = getMenuMapping(journeyTypeId, serverHttpRequest);
    Object formInstance = null;
    try {
      formInstance = createInstanceFromMenuMapping(menuMapping.getBean());
    } catch (Exception e) {
      e.printStackTrace();
    }
    return formInstance;
  }

  private Object createInstanceFromMenuMapping(Object menuEntry) throws Exception {
    if (menuEntry instanceof MDDOpenRemoteJourneyAction) {
      MDDOpenRemoteJourneyAction action = (MDDOpenRemoteJourneyAction) menuEntry;
      return action.getRemoteJourney();
    } else if (menuEntry instanceof MDDOpenEditorAction) {
      MDDOpenEditorAction action = (MDDOpenEditorAction) menuEntry;
      return ReflectionHelper.newInstance(action.getViewClass());
    } else if (menuEntry instanceof MDDOpenCRUDAction) {
      MDDOpenCRUDAction action = (MDDOpenCRUDAction) menuEntry;
      MDDOpenCRUDActionViewBuilder viewBuilder = Helper.getImpl(MDDOpenCRUDActionViewBuilder.class);
      return viewBuilder.buildView(action);
    } else if (menuEntry instanceof MDDOpenListViewAction) {
      MDDOpenListViewAction action = (MDDOpenListViewAction) menuEntry;
      return ReflectionHelper.newInstance(action.getListViewClass());
    }
    return null;
  }

  public StepMapper getStepMapper() {
    return stepMapper;
  }

  public ApplicationContext getApplicationContext() {
    return applicationContext;
  }

  public Object getLastUsedFilters(String journeyId, String stepId, String listId) {
    JourneyContainer journeyContainer = journeyRepo.findById(journeyId).get();
    return journeyContainer.getLastUsedFilters().get(stepId + "#" + listId);
  }

  public List<SortCriteria> getLastUsedOrders(String journeyId, String stepId, String listId) {
    JourneyContainer journeyContainer = journeyRepo.findById(journeyId).get();
    return journeyContainer.getLastUsedSorting().get(stepId + "#" + listId);
  }

  public void saveFilters(String journeyId, String stepId, String listId, Object filters) {
    JourneyContainer journeyContainer = journeyRepo.findById(journeyId).get();
    journeyContainer.getLastUsedFilters().put(stepId + "#" + listId, filters);
    journeyRepo.save(journeyContainer);
  }

  public void saveOrders(
      String journeyId, String stepId, String listId, List<SortCriteria> sorting) {
    JourneyContainer journeyContainer = journeyRepo.findById(journeyId).get();
    journeyContainer.getLastUsedSorting().put(stepId + "#" + listId, sorting);
    journeyRepo.save(journeyContainer);
  }
}
