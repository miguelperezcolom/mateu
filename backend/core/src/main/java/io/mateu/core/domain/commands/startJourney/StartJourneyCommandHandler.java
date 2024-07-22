package io.mateu.core.domain.commands.startJourney;

import io.mateu.core.domain.model.modelToDtoMappers.JourneyMapper;
import io.mateu.core.domain.model.modelToDtoMappers.StepMapper;
import io.mateu.core.domain.model.modelToDtoMappers.UIMapper;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.MenuToBeanMapping;
import io.mateu.core.domain.model.store.MenuToBeanMappingRepository;
import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenEditorAction;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenListViewAction;
import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.core.domain.util.Serializer;
import io.mateu.core.domain.util.exceptions.NotFoundException;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyCreationRq;
import io.mateu.dtos.Step;
import io.mateu.dtos.StepWrapper;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class StartJourneyCommandHandler {

  private final ReflectionHelper reflectionHelper;
  private final UIMapper uiMapper;
  private final MenuToBeanMappingRepository menuMappingRepo;
  private final MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder;
  private final StepMapper stepMapper;
  private final Serializer serializer;

  public StartJourneyCommandHandler(
      ReflectionHelper reflectionHelper,
      UIMapper uiMapper,
      MenuToBeanMappingRepository menuMappingRepo,
      MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder,
      StepMapper stepMapper,
      Serializer serializer) {
    this.reflectionHelper = reflectionHelper;
    this.uiMapper = uiMapper;
    this.menuMappingRepo = menuMappingRepo;
    this.mddOpenCRUDActionViewBuilder = mddOpenCRUDActionViewBuilder;
    this.stepMapper = stepMapper;
    this.serializer = serializer;
  }

  public Mono<StepWrapper> handle(StartJourneyCommand command) throws Throwable {

    String journeyId = command.getJourneyId();
    String journeyTypeId = command.getJourneyTypeId();
    JourneyCreationRq journeyCreationRq = command.getJourneyCreationRq();
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

    Journey journey = null;
    Object formInstance = null;

    try {

      formInstance = createInstanceFromJourneyTypeId(journeyTypeId, serverHttpRequest);

      if (formInstance == null) {
        throw new Exception();
      }

      journey = new JourneyMapper().map(formInstance);

    } catch (Exception e) {
      log.error("error on getUi", e);
      throw new NotFoundException("No class with name " + journeyTypeId + " found");
    }

    JourneyContainer journeyContainer =
        JourneyContainer.builder()
            .journeyTypeId(journeyTypeId)
            .journeyId(journeyId)
            .journeyClass(formInstance.getClass())
            .journeyData(journeyCreationRq.getContextData())
            .steps(Map.of())
            .journey(journey)
            .lastUsedSorting(Map.of())
            .lastUsedFilters(Map.of())
            .build();

    Step step =
        stepMapper.map(
            journeyContainer, getStepId(formInstance), null, formInstance, serverHttpRequest);
    journey.setCurrentStepId(step.getId());
    journey.setCurrentStepDefinitionId(step.getType());

    journeyContainer.setInitialStep(step);
    journeyContainer.setSteps(Map.of(step.getId(), step));

    return Mono.just(
        StepWrapper.builder().journey(journey).step(step).store(toMap(journeyContainer)).build());
  }

  private String getStepId(Object formInstance) {
    if (formInstance instanceof Listing) return "list";
    return "form";
  }

  public Object createInstanceFromJourneyTypeId(
      String journeyTypeId, ServerHttpRequest serverHttpRequest) {
    MenuToBeanMapping menuMapping = getMenuMapping(journeyTypeId, serverHttpRequest);
    Object formInstance = null;
    try {
      formInstance = createInstanceFromMenuMapping(menuMapping.getBean());

      if (formInstance instanceof HasInitMethod) {
        ((HasInitMethod) formInstance).init(serverHttpRequest);
      }

    } catch (Exception e) {
      e.printStackTrace();
    }
    return formInstance;
  }

  private Object createInstanceFromMenuMapping(Object menuEntry) throws Exception {
    if (menuEntry instanceof MDDOpenEditorAction) {
      MDDOpenEditorAction action = (MDDOpenEditorAction) menuEntry;
      return reflectionHelper.newInstance(action.getViewClass());
    } else if (menuEntry instanceof MDDOpenCRUDAction) {
      MDDOpenCRUDAction action = (MDDOpenCRUDAction) menuEntry;
      return mddOpenCRUDActionViewBuilder.buildView(action);
    } else if (menuEntry instanceof MDDOpenListViewAction) {
      MDDOpenListViewAction action = (MDDOpenListViewAction) menuEntry;
      return reflectionHelper.newInstance(action.getListViewClass());
    }
    return null;
  }

  public MenuToBeanMapping getMenuMapping(String actionId, ServerHttpRequest serverHttpRequest) {
    Optional<MenuToBeanMapping> menuToBeanMapping = menuMappingRepo.findById(actionId);
    if (menuToBeanMapping.isEmpty()) {
      if (actionId.contains("_")) { // it's a ui
        String uiClassName = actionId.split("_")[1];
        Object uiInstance = null;
        try {
          uiInstance = reflectionHelper.newInstance(Class.forName(uiClassName));
          if (uiInstance instanceof HasInitMethod) {
            ((HasInitMethod) uiInstance).init(serverHttpRequest);
          }
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
          uiInstance = reflectionHelper.newInstance(Class.forName(uiClassName));
          if (uiInstance instanceof HasInitMethod) {
            ((HasInitMethod) uiInstance).init(serverHttpRequest);
          }
          uiMapper.map(uiInstance, serverHttpRequest);
          Object finalUiInstance = uiInstance;
          storeMenuAction(actionId, new MDDOpenEditorAction("", () -> finalUiInstance));
          menuToBeanMapping = menuMappingRepo.findById(actionId);
        } catch (Exception e) {
          e.printStackTrace();
        }
      }
    }
    return menuToBeanMapping.orElse(null);
  }

  public void storeMenuAction(String actionId, Object bean) {
    menuMappingRepo.save(MenuToBeanMapping.builder().actionId(actionId).bean(bean).build());
  }

  private Map<String, Object> toMap(Object o) {
    if (o instanceof Map) {
      return (Map<String, Object>) o;
    } else {
      try {
        return serializer.toMap(o);
      } catch (Exception e) {
        e.printStackTrace();
        return Map.of();
      }
    }
  }
}
