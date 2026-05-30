package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ActionDto;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class ActionMapper {

  public static List<ActionDto> mapActions(Object serverSideObject, HttpRequest httpRequest) {
    List<ActionDto> actions = new ArrayList<>();
    actions.add(ActionDto.builder().id("nested-form-action-*").build());
    if (serverSideObject instanceof ActionSupplier hasActions) {
      actions.addAll(
          hasActions.actions(httpRequest).stream().map(ActionMapper::mapAction).toList());
    }
    if (serverSideObject instanceof ActionHandler hasActions) {
      actions.addAll(
          hasActions.supportedActions().stream()
              .filter(
                  actionId -> actions.stream().noneMatch(action -> action.id().equals(actionId)))
              .map(actionId -> ActionDto.builder().id(actionId).build())
              .toList());
    }
    actions.addAll(
        Arrays.stream(
                serverSideObject
                    .getClass()
                    .getAnnotationsByType(io.mateu.uidl.annotations.Action.class))
            .map(ActionMapper::mapToAction)
            .toList());

    List<ActionDto> fieldActions = FieldActionCollector.collect(serverSideObject);

    if (serverSideObject instanceof LookupOptionsSupplier) {
      actions.add(ActionDto.builder().id("search-*").build());
    }

    actions.addAll(
        Stream.concat(
                fieldActions.stream(),
                Arrays.stream(
                        serverSideObject
                            .getClass()
                            .getAnnotationsByType(io.mateu.uidl.annotations.Action.class))
                    .map(ActionMapper::mapToAction))
            .filter(method -> actions.stream().noneMatch(action -> action.id().equals(action.id())))
            .toList());

    if (serverSideObject instanceof ActionHandler actionHandler) {
      actions.addAll(
          actionHandler.supportedActions().stream()
              .filter(
                  actionId -> actions.stream().noneMatch(action -> action.id().equals(actionId)))
              .map(actionId -> ActionDto.builder().id(actionId).build())
              .toList());
    }

    if (Boolean.TRUE.equals(httpRequest.getAttribute("new"))) {
      actions.add(ActionDto.builder().id("create").validationRequired(true).bubble(true).build());
    }
    if (Boolean.TRUE.equals(httpRequest.getAttribute("edit"))) {
      actions.add(ActionDto.builder().id("save").validationRequired(true).bubble(true).build());
    }

    actions.addAll(fieldActions);

    return actions;
  }

  private static ActionDto mapToAction(io.mateu.uidl.annotations.Action annotation) {
    return ActionDtoMapper.mapToAction(annotation);
  }

  public static ActionDto mapAction(Action action) {
    return ActionDtoMapper.mapAction(action);
  }
}
