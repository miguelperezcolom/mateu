package io.mateu.remote.domain.store;

import com.vaadin.server.communication.UIInitHandler;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MDDOpenListViewAction;
import io.mateu.mdd.shared.interfaces.RpcView;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.commands.RunStepActionCommand;
import io.mateu.remote.domain.mappers.StepMapper;
import io.mateu.remote.domain.mappers.UIMapper;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.lang.reflect.InvocationTargetException;
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
            Object jpaRpcCrudView = createInstanceFromJourneyTypeId(container.get().getJourneyTypeId());
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

    public RpcView getRpcViewInstance(String journeyId, String stepId, String listId) throws Exception {
        Object viewInstance = getViewInstance(journeyId, stepId);
        if (viewInstance instanceof RpcView) {
            return (RpcView) viewInstance;
        }
        RpcView rpcView = (RpcView) ReflectionHelper.getValue(listId, viewInstance);
        if (rpcView == null) {
            rpcView = (RpcView) ReflectionHelper.newInstance(
                    ReflectionHelper.getFieldByName(viewInstance.getClass(), listId).getType());
            ReflectionHelper.setValue(listId, viewInstance, rpcView);
        }
        return rpcView;
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

    public void setStep(String journeyId, String stepId, Object editor) throws Throwable {
        Optional<JourneyContainer> container = journeyRepo.findById(journeyId);
        if (!container.isPresent()) {
            throw new Exception("No journey with id " + journeyId + " found");
        }
        container.get().setSteps(extendMap(container.get().getSteps(), stepId, new StepMapper().map(container.get(), stepId, editor)));
        container.get().getJourney().setCurrentStepId(stepId);
        container.get().getJourney().setCurrentStepDefinitionId(editor.getClass().getName());
        journeyRepo.save(container.get());
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
        Optional<MenuToBeanMapping> menuToBeanMapping = menuMappingRepo.findById(actionId);
        if (menuToBeanMapping.isEmpty()) {
            if (actionId.contains("_")) { // it's a ui
                String uiClassName = actionId.split("_")[1];
                Object uiInstance = null;
                try {
                    uiInstance = ReflectionHelper.newInstance(Class.forName(uiClassName));
                    new UIMapper().map(uiInstance);
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
                    new UIMapper().map(uiInstance);
                    JourneyStoreService.get().storeMenuAction(actionId, new MDDOpenEditorAction("", uiInstance));
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
