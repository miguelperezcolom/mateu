package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;
import io.mateu.dtos.UIIncrement;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudDeleteActionRunner implements ListActionRunner {

  private final Serializer serializer;
  private final ComponentFactory componentFactory;
  private final CaptionProvider captionProvider;
  private final UIIncrementFactory uIIncrementFactory;

  public CrudDeleteActionRunner(
      Serializer serializer,
      ComponentFactory componentFactory,
      CaptionProvider captionProvider,
      UIIncrementFactory uIIncrementFactory) {
    this.serializer = serializer;
    this.componentFactory = componentFactory;
    this.captionProvider = captionProvider;
    this.uIIncrementFactory = uIIncrementFactory;
  }

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "delete".equals(actionId);
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
    List selectedRows = (List) data.get("_selectedRows");

    // todo: make reactive!

    if (selectedRows == null) {
      throw new Exception("No row selected");
    }

    try {
      List<Object> targetSet =
          new ArrayList<>(
              (Collection)
                  selectedRows.stream()
                      .map(
                          m -> {
                            try {
                              return crud.getRow((Map<String, Object>) m, serializer);
                            } catch (Throwable e) {
                              e.printStackTrace();
                            }
                            return null;
                          })
                      .collect(Collectors.toList()));
      crud.delete(targetSet);

      Result whatToShow =
          new Result(
              ResultType.Success,
              "" + selectedRows + " elements have been deleted",
              List.of(),
              new Destination(
                  DestinationType.ActionId,
                  "Back to " + captionProvider.getCaption(crud),
                  crudStepId),
              null);

      return Mono.just(
          uIIncrementFactory.createForSingleComponent(
              componentFactory.createFormComponent(whatToShow, serverHttpRequest, data)));

    } catch (Throwable e) {
      throw new Exception(
          "Crud delete throwed " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }
  }
}
