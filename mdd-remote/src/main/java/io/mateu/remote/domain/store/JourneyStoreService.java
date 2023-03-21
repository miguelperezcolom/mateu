package io.mateu.remote.domain.store;

import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.mappers.StepMapper;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class JourneyStoreService {

    private static JourneyStoreService _instance;

    public static JourneyStoreService get() {
        return _instance;
    }

    @PostConstruct
    public void init() {
        _instance = this;
    }


    @Autowired
    private JourneyRepository journeyRepo;

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
            Object jpaRpcCrudView = createInstanceFromJourneyId(journeyId);
            return jpaRpcCrudView;
        } else {
            Object viewInstance = ReflectionHelper.newInstance(Class.forName(step.getType()));
            Map<String, Object> data = step.getView().getComponents().get(0).getData();
            data.entrySet()
                    .stream().filter(entry -> checkNotInjected(viewInstance, entry.getKey()))
                    .forEach(entry -> {
                try {
                    Object actualValue = RunStepActionCommand.getActualValue(entry, viewInstance);
                    ReflectionHelper.setValue(entry.getKey(), viewInstance, actualValue);
                } catch (Exception ex) {
                    System.out.println("" + ex.getClass().getSimpleName() + ": " + ex.getMessage());
                }
            });
            return viewInstance;
        }
    }

    private boolean checkNotInjected(Object viewInstance, String fieldName) {
        FieldInterfaced field = ReflectionHelper.getFieldByName(viewInstance.getClass(), fieldName);
        return field != null && !field.isAnnotationPresent(Autowired.class);
    }

    public Optional<JourneyContainer> findJourneyById(String journeyId) {
        return journeyRepo.findById(journeyId);
    }

    public void save(JourneyContainer journeyContainer) {
        journeyRepo.save(journeyContainer);
    }

    public void setStep(String journeyId, String stepId, Object editor) throws Exception {
        Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
        if (!container.isPresent()) {
            throw new Exception("No journey with id " + journeyId + " found");
        }
        container.get().setSteps(extendMap(container.get().getSteps(), stepId, new StepMapper().map(stepId, editor)));
        container.get().getJourney().setCurrentStepId(stepId);
        container.get().getJourney().setCurrentStepDefinitionId(editor.getClass().getName());
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
        return container.get().getSteps().get(stepId);
    }

    public Step getInitialStep(String journeyId) throws Exception {
        Optional<JourneyContainer> container = findJourneyById(journeyId);
        if (!container.isPresent()) {
            throw new Exception("No journey with id " + journeyId + " found");
        }
        return container.get().getInitialStep();
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
        return menuMappingRepo.findById(actionId).orElse(null);
    }

    public Object createInstanceFromJourneyId(String journeyId) {
        MenuToBeanMapping menuMapping = getMenuMapping(journeyId);
        Object formInstance = null;
        try {
            formInstance = createInstanceFromMenuMapping(menuMapping.getBean());
        } catch (Exception e) {
            e.printStackTrace();
        }
        return formInstance;
    }

    private Object createInstanceFromMenuMapping(Object menuEntry) throws Exception {
        if (menuEntry instanceof MDDOpenEditorAction) {
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


}
