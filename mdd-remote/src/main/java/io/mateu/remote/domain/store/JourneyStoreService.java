package io.mateu.remote.domain.store;

import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.runStep.ActualValueExtractor;
import io.mateu.remote.domain.editors.EntityEditor;
import io.mateu.remote.domain.editors.FieldEditor;
import io.mateu.remote.domain.modelToDtoMappers.StepMapper;
import io.mateu.remote.domain.modelToDtoMappers.UIMapper;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

import java.lang.reflect.Modifier;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service@Slf4j
public class JourneyStoreService {

    @Autowired
    private StepMapper stepMapper;

    @Autowired
    private UIMapper uiMapper;

    @Autowired
    private JourneyRepository journeyRepo;

    @Autowired
    private ActualValueExtractor actualValueExtractor;

    @Autowired
    private ApplicationContext applicationContext;

    public Object getViewInstance(String journeyId, String stepId) throws Exception {
        Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
        if (!container.isPresent()) {
            throw new Exception("No journey with id " + journeyId + " found");
        }
        Step step = container.get().getSteps().get(stepId);
        if (step == null) {
            throw new Exception("No step with id " + stepId + " for journey with id " + journeyId + " found");
        }
        if ("io.mateu.mdd.ui.cruds.JpaRpcCrudView".equals(step.getType())) {
            Object jpaRpcCrudView = createInstanceFromJourneyTypeId(container.get().getJourneyTypeId());
            return jpaRpcCrudView;
        } else {
            Object viewInstance = ReflectionHelper.newInstance(Class.forName(step.getType()));
            Map<String, Object> data = step.getData();
            if (viewInstance instanceof EntityEditor) {
                ((EntityEditor) viewInstance).setEntityClass(Class.forName((String) data.get("__entityClassName__")));
                ((EntityEditor) viewInstance).setData(data);
            } else if (viewInstance instanceof FieldEditor) {
                ((FieldEditor) viewInstance).setType(Class.forName((String) data.get("__type__")));
                ((FieldEditor) viewInstance).setFieldId((String) data.get("__fieldId__"));
                ((FieldEditor) viewInstance).setInitialStep((String) data.get("__initialStep__"));
                ((FieldEditor) viewInstance).setData(data);
            } else {
                data.entrySet()
                        .forEach(entry -> {
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

    public Listing getRpcViewInstance(String journeyId, String stepId, String listId) throws Exception {
        try {
            Object viewInstance = getViewInstance(journeyId, stepId);
            if (viewInstance instanceof Listing) {
                return (Listing) viewInstance;
            }
            Listing rpcView = (Listing) ReflectionHelper.getValue(listId, viewInstance);
            if (rpcView == null) {
                FieldInterfaced listField = ReflectionHelper.getFieldByName(viewInstance.getClass(), listId);
                if (listField != null) {
                    rpcView = (Listing) ReflectionHelper.newInstance(listField.getType());
                    ReflectionHelper.setValue(listId, viewInstance, rpcView);
                }
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

    public void updateStep(String journeyId, Object editor) throws Throwable {
        Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
        if (!container.isPresent()) {
            throw new Exception("No journey with id " + journeyId + " found");
        }
        String stepId = container.get().getJourney().getCurrentStepId();
        Step oldStep = container.get().getSteps().get(stepId);
        Step step = stepMapper.map(container.get(), stepId, oldStep.getPreviousStepId(), editor);
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

    public void setStep(String journeyId, String stepId, Object editor) throws Throwable {
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
        Step step = stepMapper.map(container.get(), newStepId, getPreviousStepId(newStepId, container), editor);
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
            throw new Exception("No step with id " + stepId + " for journey with id " + journeyId + " found");
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

    @Autowired
    private MenuToBeanMappingRepository menuMappingRepo;

    public void storeMenuAction(String actionId, Object bean) {
        menuMappingRepo.save(MenuToBeanMapping.builder()
                        .actionId(actionId)
                        .bean(bean)
                .build());
    }

    public MenuToBeanMapping getMenuMapping(String actionId) {
        Optional<MenuToBeanMapping> menuToBeanMapping = menuMappingRepo.findById(actionId);
        if (menuToBeanMapping.isEmpty()) {
            if (actionId.contains("_")) { // it's a ui
                String uiClassName = actionId.split("_")[1];
                Object uiInstance = null;
                try {
                    uiInstance = ReflectionHelper.newInstance(Class.forName(uiClassName));
                    uiMapper.map(uiInstance);
                    menuToBeanMapping = menuMappingRepo.findById(actionId);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            } else { // it's a form
                String uiClassName = actionId;
                Object uiInstance = null;
                try {
                    //todo: refactor for improving
                    uiInstance = ReflectionHelper.newInstance(Class.forName(uiClassName));
                    uiMapper.map(uiInstance);
                    storeMenuAction(actionId, new MDDOpenEditorAction("", uiInstance));
                    menuToBeanMapping = menuMappingRepo.findById(actionId);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
        return menuToBeanMapping.orElse(null);
    }

    public Object createInstanceFromJourneyTypeId(String journeyTypeId) {
        MenuToBeanMapping menuMapping = getMenuMapping(journeyTypeId);
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
            MDDOpenCRUDActionViewBuilder viewBuilder =
                    Helper.getImpl(MDDOpenCRUDActionViewBuilder.class);
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
}
