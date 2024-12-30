package io.mateu.core.domain.commands.startJourney;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.*;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.dtos.*;
import io.mateu.uidl.app.*;
import io.mateu.uidl.interfaces.ConsumesContextData;
import io.mateu.uidl.interfaces.ConsumesUrlFragment;
import io.mateu.uidl.interfaces.HasInitMethod;
import io.mateu.uidl.interfaces.JourneyStarter;
import io.mateu.uidl.views.SingleComponentView;
import java.util.LinkedHashMap;
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

  private final ReflectionService reflectionService;
  private final MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder;
  private final MenuResolver menuResolver;
  private final UiInstantiator uiInstantiator;
  private final ViewMapper viewMapper;

  public StartJourneyCommandHandler(
      ReflectionService reflectionService,
      MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder,
      MenuResolver menuResolver,
      UiInstantiator uiInstantiator,
      ViewMapper viewMapper) {
    this.reflectionService = reflectionService;
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

      if (formInstance instanceof ConsumesUrlFragment consumesUrlFragment) {
        var hash = command.getJourneyCreationRq().hash();
        if (hash != null && hash.contains("____x")) {
          formInstance =
              consumesUrlFragment.consume(
                  hash.substring(hash.indexOf("____x") + "____x".length()), serverHttpRequest);
        }
      }

      if (formInstance instanceof JourneyStarter journeyStarter) {
        return Mono.just(
            new UIIncrement(
                List.of(
                    new UICommand(
                        UICommandType.ReplaceJourney,
                        new io.mateu.dtos.JourneyStarter(
                            journeyStarter.uiId(),
                            journeyStarter.baseUrl(),
                            journeyStarter.journeyTypeId(),
                            journeyStarter.contextData()))),
                List.of(),
                List.of()));
      }

    } catch (Exception e) {
      log.error("error on getUi", e);
      // throw new NotFoundException("No class with name " + journeyTypeId + " found");
      throw e;
    }

    Map<String, Component> allComponents = new LinkedHashMap<>();
    io.mateu.uidl.interfaces.View view =
        (formInstance instanceof io.mateu.uidl.interfaces.View v)
            ? v
            : new SingleComponentView(formInstance);
    View viewDto = viewMapper.map(view, serverHttpRequest, allComponents, Map.of());

    return Mono.just(
        new UIIncrement(
            List.of(),
            List.of(),
            List.of(
                new UIFragment(
                    io.mateu.dtos.ActionTarget.View, "", "", "", viewDto, allComponents))));
  }

  public Object resolveJourneyTypeId(
      String uiId, String journeyTypeId, ServerHttpRequest serverHttpRequest) {

    var ui = uiInstantiator.instantiateUi(uiId, serverHttpRequest);

    var menuEntry = menuResolver.resolve(ui, journeyTypeId, serverHttpRequest);

    return menuEntry.map(entry -> createInstanceFromMenuMapping(entry)).orElse(null);
  }

  @SneakyThrows
  public Object createInstanceFromMenuMapping(Object menuEntry) {
    if (menuEntry instanceof JourneyStarter journeyStarter) {
      return journeyStarter;
    }
    if (menuEntry instanceof MDDOpenEditorAction action) {
      if (action.getSupplier() != null) {
        return action.getSupplier().get();
      }
      return reflectionService.newInstance(action.getViewClass());
    } else if (menuEntry instanceof MDDOpenCRUDAction action) {
      return mddOpenCRUDActionViewBuilder.buildView(action);
    } else if (menuEntry instanceof MDDOpenListViewAction action) {
      if (action.getSupplier() != null) {
        return action.getSupplier().get();
      }
      return reflectionService.newInstance(action.getListViewClass());
    } else if (menuEntry instanceof MDDOpenHtmlAction action) {
      return action.html;
    }
    return null;
  }
}
