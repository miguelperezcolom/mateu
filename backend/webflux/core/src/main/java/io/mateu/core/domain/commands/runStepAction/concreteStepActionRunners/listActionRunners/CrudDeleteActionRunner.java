package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.outbound.metadataBuilders.CaptionProvider;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.ComponentFactory;
import io.mateu.core.domain.model.outbound.modelToDtoMappers.UIIncrementFactory;
import io.mateu.core.domain.model.util.SerializerService;
import io.mateu.dtos.UIIncrement;
import io.mateu.uidl.core.data.Destination;
import io.mateu.uidl.core.data.DestinationType;
import io.mateu.uidl.core.data.Result;
import io.mateu.uidl.core.data.ResultType;
import io.mateu.uidl.core.interfaces.Crud;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudDeleteActionRunner implements ListActionRunner {

  private final SerializerService serializerService;
  private final ComponentFactory componentFactory;
  private final CaptionProvider captionProvider;
  private final UIIncrementFactory uIIncrementFactory;

  public CrudDeleteActionRunner(
      SerializerService serializerService,
      ComponentFactory componentFactory,
      CaptionProvider captionProvider,
      UIIncrementFactory uIIncrementFactory) {
    this.serializerService = serializerService;
    this.componentFactory = componentFactory;
    this.captionProvider = captionProvider;
    this.uIIncrementFactory = uIIncrementFactory;
  }

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "delete".equals(actionId.substring(actionId.lastIndexOf("__") + 2));
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
                              return crud.getRow((Map<String, Object>) m, serializerService);
                            } catch (Throwable e) {
                              e.printStackTrace();
                            }
                            return null;
                          })
                      .collect(Collectors.toList()));
      crud.delete(targetSet);

      Result whatToShow =
          new Result(
              "Rows deleted",
              ResultType.Success,
              getMessage(targetSet),
              List.of(),
              new Destination(
                  "backToCrud",
                  DestinationType.Component,
                  "Back to " + captionProvider.getCaption(crud),
                  null),
              null,
              new CrudDeleteResultActionHandler(crud));

      return Mono.just(
          uIIncrementFactory.createForSingleComponent(
              componentFactory.createFormComponent(whatToShow, serverHttpRequest, data)));

    } catch (Throwable e) {
      throw new Exception(
          "Crud delete throwed " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }
  }

  private String getMessage(List<Object> targetSet) {
    if (targetSet == null || targetSet.isEmpty()) {
      return "Nothing has been deleted.";
    }
    if (targetSet.size() == 1) {
      return targetSet.get(0).toString() + " has been deleted.";
    }
    var msg = new StringBuilder("" + targetSet.get(0));
    for (int i = 1; i < targetSet.size() - 1; i++) {
      msg.append(", " + targetSet.get(i));
    }
    msg.append(" and " + targetSet.get(targetSet.size() - 1));
    msg.append(" have been deleted.");
    return msg.toString();
  }
}
