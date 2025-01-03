package io.mateu.core.domain.commands.startJourney;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.*;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.*;
import io.mateu.uidl.app.*;
import io.mateu.uidl.interfaces.ConsumesContextData;
import io.mateu.uidl.interfaces.ConsumesUrlFragment;
import io.mateu.uidl.interfaces.HasInitMethod;
import io.mateu.uidl.interfaces.MicroFrontend;
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
  private final SerializerService serializerService;

  public StartJourneyCommandHandler(
      ReflectionService reflectionService,
      MDDOpenCRUDActionViewBuilder mddOpenCRUDActionViewBuilder,
      MenuResolver menuResolver,
      UiInstantiator uiInstantiator,
      ViewMapper viewMapper,
      SerializerService serializerService) {
    this.reflectionService = reflectionService;
    this.mddOpenCRUDActionViewBuilder = mddOpenCRUDActionViewBuilder;
    this.menuResolver = menuResolver;
    this.uiInstantiator = uiInstantiator;
    this.viewMapper = viewMapper;
    this.serializerService = serializerService;
  }

  public Mono<UIIncrementDto> handle(StartJourneyCommand command) throws Throwable {

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

      if (formInstance instanceof MicroFrontend microFrontend) {
        return Mono.just(
            new UIIncrementDto(
                List.of(
                    new UICommandDto(
                        UICommandTypeDto.ReplaceJourney,
                        new MicroFrontendDto(
                            microFrontend.baseUrl(),
                            microFrontend.journeyTypeId(),
                            serializerService.toJson(microFrontend.contextData())))),
                List.of(),
                List.of()));
      }

    } catch (Exception e) {
      log.error("error on getUi", e);
      // throw new NotFoundException("No class with name " + journeyTypeId + " found");
      throw e;
    }

    Map<String, ComponentDto> allComponents = new LinkedHashMap<>();
    io.mateu.uidl.interfaces.View view =
        (formInstance instanceof io.mateu.uidl.interfaces.View v)
            ? v
            : new SingleComponentView(formInstance);
    ViewDto viewDto =
        viewMapper.map(view, command.getBaseUrl(), serverHttpRequest, allComponents, Map.of());

    return Mono.just(
        new UIIncrementDto(
            List.of(),
            List.of(),
            List.of(new UIFragmentDto(ActionTargetDto.View, "", "", "", viewDto, allComponents))));
  }

  public Object resolveJourneyTypeId(
      String uiId, String journeyTypeId, ServerHttpRequest serverHttpRequest) {

    var ui = uiInstantiator.instantiateUi(uiId, serverHttpRequest);

    var menuEntry = menuResolver.resolve(ui, journeyTypeId, serverHttpRequest);

    return menuEntry.map(entry -> createInstanceFromMenuMapping(entry)).orElse(null);
  }

  @SneakyThrows
  public Object createInstanceFromMenuMapping(Object menuEntry) {
    if (menuEntry instanceof MicroFrontend microFrontend) {
      return microFrontend;
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
