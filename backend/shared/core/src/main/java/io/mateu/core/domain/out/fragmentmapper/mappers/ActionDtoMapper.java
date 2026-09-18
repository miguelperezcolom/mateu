package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ConfirmationTextsDto;
import io.mateu.dtos.CustomEventDto;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.Step;
import java.util.List;

final class ActionDtoMapper {

  /** Delegates to the record's own factory — the conversion is pure uidl, the DTOs are ours. */
  static Action mapToAction(io.mateu.uidl.annotations.Action annotation) {
    return Action.of(annotation);
  }

  static ActionDto mapAction(Action action) {
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
                ? new CustomEventDto(
                    action.customEvent().eventName(), action.customEvent().detail())
                : null)
        .sse(action.sse())
        .shortcut(action.shortcut())
        .timeoutMillis(action.timeoutMillis())
        .idempotent(action.idempotent())
        .restAction(mapRestAction(action.restAction()))
        .commands(mapSteps(action.steps()))
        .build();
  }

  /**
   * Lowers a declared flow (fluent {@code Action.steps}) to the wire commands the client runs
   * without a server round-trip. Null when there is no flow, so a normal action carries no commands
   * member. targetComponentId is left null: the frontend applies each command on the component that
   * fired the action.
   */
  private static List<UICommandDto> mapSteps(List<Step> steps) {
    if (steps == null || steps.isEmpty()) {
      return null;
    }
    return steps.stream()
        .map(Step::toCommand)
        .map(
            command ->
                new UICommandDto(
                    null, UICommandTypeDto.valueOf(command.type().name()), command.data()))
        .toList();
  }

  private static io.mateu.dtos.RestActionDto mapRestAction(
      io.mateu.uidl.data.RestAction restAction) {
    if (restAction == null) {
      return null;
    }
    var sourceDto = FieldMapper.mapRestDataSource(restAction.source());
    return new io.mateu.dtos.RestActionDto(
        sourceDto,
        restAction.successMessage(),
        restAction.resultPath(),
        restAction.successRoute(),
        restAction.forEachSelectedRow());
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
