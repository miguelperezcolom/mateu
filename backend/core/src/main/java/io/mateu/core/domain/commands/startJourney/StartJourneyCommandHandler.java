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
import io.mateu.dtos.Component;
import io.mateu.dtos.UIIncrement;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import io.mateu.dtos.View;
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
  private final MenuResolver menuResolver;
  private final UiInstantiator uiInstantiator;
  private final ViewMapper viewMapper;

  public StartJourneyCommandHandler(
          ReflectionHelper reflectionHelper,
          MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder,
          MenuResolver menuResolver,
          UiInstantiator uiInstantiator, ViewMapper viewMapper) {
    this.reflectionHelper = reflectionHelper;
    this.mddOpenCRUDActionViewBuilder = mddOpenCRUDActionViewBuilder;
    this.menuResolver = menuResolver;
    this.uiInstantiator = uiInstantiator;
    this.viewMapper = viewMapper;
  }

  public Mono<UIIncrement> handle(StartJourneyCommand command) throws Throwable {

    String uiId = command.getUiId();
    String journeyTypeId = command.getJourneyTypeId();
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

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

    } catch (Exception e) {
      log.error("error on getUi", e);
      throw new NotFoundException("No class with name " + journeyTypeId + " found");
    }

    Map<String, Component> allComponents = new LinkedHashMap<>();
    View view = viewMapper.map(formInstance, serverHttpRequest, allComponents);

    return Mono.just(new UIIncrement(List.of(), view, List.of(), allComponents));
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
}
