package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ViewMapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Container;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import io.mateu.core.domain.uidefinitionlanguage.core.views.SingleComponentView;
import io.mateu.core.domain.uidefinitionlanguage.shared.interfaces.JourneyStarter;
import io.mateu.dtos.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class CrudEditActionRunner implements ListActionRunner {

  final ReflectionHelper reflectionHelper;
  final Serializer serializer;
  final FiltersDeserializer filtersDeserializer;
  final ComponentFactory componentFactory;
  private final UIIncrementFactory uIIncrementFactory;
  private final ViewMapper viewMapper;

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "edit".equals(actionId.substring(actionId.lastIndexOf("__") + 2));
  }

  @Override
  public Mono<UIIncrement> run(
      Crud crud,
      String crudStepId,
      String actionId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    // todo: make reactive!

    Object row = data.get("_selectedRow");

    int __index = (Integer) data.getOrDefault("__index", -1);
    int __count = (Integer) data.getOrDefault("__count", -1);

    String searchText = (String) data.getOrDefault("__searchText", "");

    if (row == null && (__index == -1 && __count == -1)) {
      throw new Exception("No row selected");
    }

    if (row == null) {

      Object filtersDeserialized = filtersDeserializer.deserialize(crud, data, serverHttpRequest);

      // todo: recover ordering
      var ordering = List.of(); // store.getLastUsedOrders(journeyContainer, stepId, listId);
      var pageable = PageRequest.of(__index, 1, Sort.unsorted());

      Page page = (Page) crud.fetchRows(searchText, filtersDeserialized, pageable).toFuture().get();

      row = page.get().findFirst().get();
    }

    Object editor = null;
    try {
      if (row instanceof Map) {
        row = crud.getRow((Map<String, Object>) row, serializer);
      }
      editor = crud.getDetail(row);
    } catch (Throwable e) {
      throw new Exception(
          "When getting detail for row " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    if (editor == null) {
      throw new Exception("Crud getDetail returned null");
    }

    if (editor instanceof JourneyStarter journeyStarter) {
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

    if (editor instanceof Container) {
      Map<String, Component> allComponents = new LinkedHashMap<>();
      View view =
          viewMapper.map(
              new SingleComponentView(editor), serverHttpRequest, allComponents, Map.of());
      return Mono.just(
          new UIIncrement(
              List.of(),
              List.of(),
              List.of(new UIFragment(ActionTarget.View, "", "", view, allComponents))));
    }

    return Mono.just(
        uIIncrementFactory.createForSingleComponent(
            componentFactory.createFormComponent(editor, serverHttpRequest, data)));
  }
}
