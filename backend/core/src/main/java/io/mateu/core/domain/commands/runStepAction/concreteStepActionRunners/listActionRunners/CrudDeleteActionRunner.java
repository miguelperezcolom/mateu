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
import io.mateu.dtos.Component;
import io.mateu.dtos.UIIncrement;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

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
                              return crud.getRow((Map<String, Object>) m, serializer);
                            } catch (Throwable e) {
                              e.printStackTrace();
                            }
                            return null;
                          })
                      .collect(Collectors.toList()));
      crud.delete(targetSet);

      Map<String, Component> backToComponents = new HashMap<>();
      String backToComponentId = componentFactory.createComponent(false, crud, serverHttpRequest, null, List.of(), backToComponents, new AtomicInteger(), data);

      Result whatToShow =
          new Result(
              ResultType.Success,
              getMessage(targetSet),
              List.of(),
              new Destination(
                  DestinationType.Component,
                  "Back to " + captionProvider.getCaption(crud),
                  backToComponents.get(backToComponentId)),
              null);

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
    String msg = "" + targetSet.get(0);
    for (int i = 1; i < targetSet.size() - 1; i++) {
      msg += ", " + targetSet.get(i);
    }
    msg += " and " + targetSet.get(targetSet.size() - 1);
    return msg + " have been deleted.";
  }
}
