package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.domain.BasicTypeChecker.isBasic;
import static io.mateu.core.domain.BasicTypeChecker.isBasicArray;
import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.ValueProvider.getValueOrNewInstance;

import io.mateu.dtos.ActionDto;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.util.*;
import java.util.stream.Stream;

public class ActionMapper {

  public static List<ActionDto> mapActions(Object serverSideObject, HttpRequest httpRequest) {
    List<ActionDto> actions = new ArrayList<>();
    // actions.add(ActionDto.builder().id("nested-form-action-*").build());
    actions.addAll(
        addNestedFormsActions(
            "nested-form-action-", serverSideObject.getClass(), serverSideObject, httpRequest));
    if (serverSideObject.getClass().isAnnotationPresent(AutoSave.class)) {
      actions.add(ActionDto.builder().id("*").build());
    }
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

  private static List<? extends ActionDto> addNestedFormsActions(
      String prefix,
      Class<?> serverSideObjectType,
      Object serverSideObject,
      HttpRequest httpRequest) {
    List<ActionDto> actions = new ArrayList<>();
    getAllFields(serverSideObjectType).stream()
        .filter(
            field ->
                !isBasic(field.getType())
                    && !field.getType().isEnum()
                    && !List.class.isAssignableFrom(field.getType())
                    && !Map.class.isAssignableFrom(field.getType())
                    && !Amount.class.equals(field.getType())
                    && !Status.class.equals(field.getType())
                    && !isBasicArray(field.getType()))
        .forEach(
            field -> {
              List<ActionDto> nestedFormActions = new ArrayList<>();

              var nestedForm = getValueOrNewInstance(field, serverSideObject, httpRequest);
              var nestedFormType = field.getType();

              if (nestedForm instanceof ActionSupplier hasActions) {
                nestedFormActions.addAll(
                    hasActions.actions(httpRequest).stream().map(ActionMapper::mapAction).toList());
              }
              if (nestedForm instanceof ActionHandler hasActions) {
                nestedFormActions.addAll(
                    hasActions.supportedActions().stream()
                        .filter(
                            actionId ->
                                nestedFormActions.stream()
                                    .noneMatch(action -> action.id().equals(actionId)))
                        .map(actionId -> ActionDto.builder().id(actionId).build())
                        .toList());
              }
              nestedFormActions.addAll(
                  Arrays.stream(
                          nestedFormType.getAnnotationsByType(
                              io.mateu.uidl.annotations.Action.class))
                      .map(ActionMapper::mapToAction)
                      .toList());

              List<ActionDto> fieldActions = FieldActionCollector.collect(nestedForm);

              if (nestedForm instanceof LookupOptionsSupplier) {
                nestedFormActions.add(ActionDto.builder().id("search-*").build());
              }

              nestedFormActions.addAll(
                  Stream.concat(
                          fieldActions.stream(),
                          Arrays.stream(
                                  nestedFormType.getAnnotationsByType(
                                      io.mateu.uidl.annotations.Action.class))
                              .map(ActionMapper::mapToAction))
                      .filter(
                          method ->
                              nestedFormActions.stream()
                                  .noneMatch(action -> action.id().equals(action.id())))
                      .toList());

              if (nestedForm instanceof ActionHandler actionHandler) {
                nestedFormActions.addAll(
                    actionHandler.supportedActions().stream()
                        .filter(
                            actionId ->
                                nestedFormActions.stream()
                                    .noneMatch(action -> action.id().equals(actionId)))
                        .map(actionId -> ActionDto.builder().id(actionId).build())
                        .toList());
              }
              actions.addAll(
                  nestedFormActions.stream()
                      .map(action -> action.withId(field.getName() + "-" + action.id()))
                      .toList());
            });
    return actions.stream().map(action -> action.withId(prefix + action.id())).toList();
  }

  private static ActionDto mapToAction(io.mateu.uidl.annotations.Action annotation) {
    return ActionDtoMapper.mapToAction(annotation);
  }

  public static ActionDto mapAction(Action action) {
    return ActionDtoMapper.mapAction(action);
  }
}
