package io.mateu.core.domain.commands.startJourney;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.*;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.model.util.exceptions.NotFoundException;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDAction;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenCRUDActionViewBuilder;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenEditorAction;
import io.mateu.core.domain.uidefinition.core.app.MDDOpenListViewAction;
import io.mateu.core.domain.uidefinition.core.interfaces.ConsumesContextData;
import io.mateu.core.domain.uidefinition.core.interfaces.HasInitMethod;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.Journey;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.JourneyCreationRq;
import io.mateu.dtos.Step;
import io.mateu.dtos.StepWrapper;
import java.util.List;
import java.util.Map;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class StartJourneyCommandHandler {

  private final ReflectionHelper reflectionHelper;
  private final MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder;
  private final StepMapper stepMapper;
  private final Serializer serializer;
  private final MenuResolver menuResolver;
  private final UiInstantiator uiInstantiator;

  public StartJourneyCommandHandler(
      ReflectionHelper reflectionHelper,
      MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder,
      StepMapper stepMapper,
      Serializer serializer,
      MenuResolver menuResolver,
      UiInstantiator uiInstantiator) {
    this.reflectionHelper = reflectionHelper;
    this.mddOpenCRUDActionViewBuilder = mddOpenCRUDActionViewBuilder;
    this.stepMapper = stepMapper;
    this.serializer = serializer;
    this.menuResolver = menuResolver;
    this.uiInstantiator = uiInstantiator;
  }

  public Mono<StepWrapper> handle(StartJourneyCommand command) throws Throwable {

    String uiId = command.getUiId();
    String journeyId = command.getJourneyId();
    String journeyTypeId = command.getJourneyTypeId();
    JourneyCreationRq journeyCreationRq = command.getJourneyCreationRq();
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

    Journey journey = null;
    Object formInstance = null;

    try {

      formInstance = resolveJourneyTypeId(uiId, journeyTypeId, serverHttpRequest);

      if (formInstance == null) {
        throw new Exception();
      }

      if (formInstance instanceof HasInitMethod hasInitMethod) {
        hasInitMethod.init(serverHttpRequest);
      }

      if (formInstance instanceof ConsumesContextData consumesContextData) {
        consumesContextData.consume(
            command.getJourneyCreationRq().contextData(), serverHttpRequest);
      }

      journey = new JourneyMapper().map(formInstance);

    } catch (Exception e) {
      log.error("error on getUi", e);
      throw new NotFoundException("No class with name " + journeyTypeId + " found");
    }

    JourneyContainer journeyContainer =
        new JourneyContainer(
            journeyId,
            journeyTypeId,
            formInstance.getClass(),
            journeyCreationRq.contextData(),
            journey,
            Map.of(),
            List.of(),
            null,
            Map.of(),
            Map.of(),
            false);

    Step step =
        stepMapper.map(
            journeyContainer, getStepId(formInstance), null, formInstance, serverHttpRequest, null);
    journey =
        new Journey(
            journey.type(), journey.status(), journey.statusMessage(), step.id(), step.type());

    journeyContainer =
        new JourneyContainer(
            journeyContainer.journeyId(),
            journeyContainer.journeyTypeId(),
            journeyContainer.journeyClass(),
            journeyContainer.journeyData(),
            journey,
            Map.of(step.id(), step),
            List.of(step.id()),
            step.id(),
            journeyContainer.lastUsedFilters(),
            journeyContainer.lastUsedSorting(),
            false);

    return Mono.just(
        new StepWrapper(
            journey, step, toMap(journeyContainer), journeyContainer.modalMustBeClosed()));
  }

  private String getStepId(Object formInstance) {
    if (formInstance instanceof Listing) return "list";
    return "form";
  }

  public Object resolveJourneyTypeId(
      String uiId, String journeyTypeId, ServerHttpRequest serverHttpRequest) {

    var ui = uiInstantiator.instantiateUi(uiId, serverHttpRequest);

    var menuEntry = menuResolver.resolve(ui, journeyTypeId, serverHttpRequest);

    return menuEntry.map(entry -> createInstanceFromMenuMapping(entry)).orElse(null);
  }

  @SneakyThrows
  private Object createInstanceFromMenuMapping(Object menuEntry) {
    if (menuEntry instanceof MDDOpenEditorAction action) {
      if (action.getSupplier() != null) {
        return action.getSupplier().get();
      }
      return reflectionHelper.newInstance(action.getViewClass());
    } else if (menuEntry instanceof MDDOpenCRUDAction action) {
      return mddOpenCRUDActionViewBuilder.buildView(action);
    } else if (menuEntry instanceof MDDOpenListViewAction action) {
      if (action.getSupplier() != null) {
        return action.getSupplier().get();
      }
      return reflectionHelper.newInstance(action.getListViewClass());
    }
    return null;
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
