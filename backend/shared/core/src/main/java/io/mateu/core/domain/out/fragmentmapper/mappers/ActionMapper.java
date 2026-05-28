package io.mateu.core.domain.out.fragmentmapper.mappers;

import static io.mateu.core.infra.reflection.read.AllFieldsProvider.getAllFields;
import static io.mateu.core.infra.reflection.read.AllMethodsProvider.getAllMethods;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ConfirmationTextsDto;
import io.mateu.dtos.CustomEventDto;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LookupOptionsSupplier;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

public class ActionMapper {

  public static List<ActionDto> mapActions(Object serverSideObject, HttpRequest httpRequest) {
    List<ActionDto> actions = new ArrayList<>();
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

    List<ActionDto> fieldActions = new ArrayList<>();
    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            field ->
                mapToAction(field.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(field.getName()))
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(method -> method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class))
        .map(
            method ->
                mapToAction(method.getAnnotation(io.mateu.uidl.annotations.Action.class))
                    .withId(method.getName()))
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> List.class.isAssignableFrom(field.getType()))
        .map(Field::getName)
        .map(
            fieldName ->
                Stream.of(
                        "_create",
                        "_create-and-stay",
                        "_add",
                        "_select",
                        "_selected",
                        "_prev",
                        "_next",
                        "_save",
                        "_remove",
                        "_move-up",
                        "_move-down",
                        "_cancel")
                    .map(action -> fieldName + action)
                    .toList())
        .flatMap(List::stream)
        .map(actionId -> ActionDto.builder().id(actionId).build())
        .forEach(fieldActions::add);

    getAllFields(serverSideObject.getClass()).stream()
        .filter(field -> field.isAnnotationPresent(Lookup.class))
        .filter(field -> !field.getAnnotation(Lookup.class).bubble())
        .map(field -> ActionDto.builder().id("search-" + field.getName()).build())
        .forEach(fieldActions::add);

    if (serverSideObject instanceof LookupOptionsSupplier) {
      actions.add(ActionDto.builder().id("search-*").build());
    }

    getAllFields(serverSideObject.getClass()).stream()
        .filter(
            field ->
                !field.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)
                    && (field.isAnnotationPresent(Button.class)
                        || field.isAnnotationPresent(Toolbar.class)))
        .map(field -> ActionDto.builder().id(field.getName()).validationRequired(true).build())
        .forEach(fieldActions::add);
    getAllMethods(serverSideObject.getClass()).stream()
        .filter(
            method ->
                !method.isAnnotationPresent(io.mateu.uidl.annotations.Action.class)
                    && (method.isAnnotationPresent(Button.class)
                        || method.isAnnotationPresent(Toolbar.class)))
        .map(method -> ActionDto.builder().id(method.getName()).validationRequired(true).build())
        .forEach(fieldActions::add);

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
    return ActionDto.builder()
        .id(annotation.id())
        .validationRequired(annotation.validationRequired())
        .bubble(annotation.bubble())
        .fieldsToValidate(annotation.fieldsToValidate())
        .confirmationRequired(annotation.confirmationRequired())
        .rowsSelectedRequired(annotation.rowsSelectedRequired())
        .confirmationTexts(
            isConfirmationTextNeeded(annotation)
                ? ConfirmationTextsDto.builder()
                    .title(annotation.confirmationTitle())
                    .message(annotation.confirmationMessage())
                    .confirmationText(annotation.confirmationText())
                    .denialText(annotation.confirmationDenialText())
                    .build()
                : null)
        .modalStyle(annotation.modalStyle())
        .modalTitle(annotation.modalTitle())
        .customEvent(
            isCustomEventNeeded(annotation)
                ? CustomEventDto.builder()
                    .name(annotation.customEventName())
                    .detail(annotation.customEventDetail())
                    .build()
                : null)
        .href(annotation.href())
        .js(annotation.js())
        .background(annotation.background())
        .sse(annotation.sse())
        .build();
  }

  private static boolean isCustomEventNeeded(io.mateu.uidl.annotations.Action annotation) {
    return !annotation.customEventName().isEmpty() || !annotation.customEventDetail().isEmpty();
  }

  private static boolean isConfirmationTextNeeded(io.mateu.uidl.annotations.Action annotation) {
    return !annotation.confirmationText().isEmpty()
        || !annotation.confirmationMessage().isEmpty()
        || !annotation.confirmationTitle().isEmpty()
        || !annotation.confirmationDenialText().isEmpty();
  }

  public static ActionDto mapAction(Action action) {
    return ActionDto.builder()
        .id(action.id())
        .confirmationRequired(action.confirmationRequired())
        .validationRequired(action.validationRequired())
        .fieldsToValidate(action.fieldsToValidate())
        .bubble(action.bubble())
        .background(action.background())
        .confirmationTexts(mapConfirmationTexts(action.confirmationTexts()))
        .rowsSelectedRequired(action.rowsSelectedRequired())
        .href(action.href())
        .js(action.js())
        .customEvent(
            action.customEvent() != null
                ? new CustomEventDto(action.customEvent().name(), action.customEvent().detail())
                : null)
        .sse(action.sse())
        .build();
  }

  private static ConfirmationTextsDto mapConfirmationTexts(ConfirmationTexts confirmationTexts) {
    if (confirmationTexts == null) {
      return null;
    }
    return new ConfirmationTextsDto(
        confirmationTexts.title(),
        confirmationTexts.message(),
        confirmationTexts.confirmationText(),
        confirmationTexts.denialText());
  }
}
