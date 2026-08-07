package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ConfirmationTextsDto;
import io.mateu.dtos.CustomEventDto;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.CustomEvent;

final class ActionDtoMapper {

  static Action mapToAction(io.mateu.uidl.annotations.Action annotation) {
    return Action.builder()
        .id(annotation.id())
        .validationRequired(annotation.validationRequired())
        .bubble(annotation.bubble())
        .fieldsToValidate(annotation.fieldsToValidate())
        .confirmationRequired(annotation.confirmationRequired())
        .rowsSelectedRequired(annotation.rowsSelectedRequired())
        .confirmationTexts(
            isConfirmationTextNeeded(annotation)
                ? ConfirmationTexts.builder()
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
                ? CustomEvent.builder()
                    .eventName(annotation.customEventName())
                    .detail(annotation.customEventDetail())
                    .build()
                : null)
        .href(annotation.href())
        .js(annotation.js())
        .background(annotation.background())
        .sse(annotation.sse())
        .shortcut(annotation.shortcut().isEmpty() ? null : annotation.shortcut())
        .timeoutMillis(annotation.timeoutMillis())
        .idempotent(annotation.idempotent())
        .build();
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
        .build();
  }

  private static io.mateu.dtos.RestActionDto mapRestAction(
      io.mateu.uidl.data.RestAction restAction) {
    if (restAction == null) {
      return null;
    }
    var s = restAction.source();
    var sourceDto =
        s == null
            ? null
            : new io.mateu.dtos.RestDataSourceDto(
                s.url(),
                s.method(),
                s.headers(),
                s.body(),
                s.itemsPath(),
                s.valuePath(),
                s.labelPath(),
                s.proxy());
    return new io.mateu.dtos.RestActionDto(
        sourceDto, restAction.successMessage(), restAction.resultPath());
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

  private static boolean isCustomEventNeeded(io.mateu.uidl.annotations.Action annotation) {
    return !annotation.customEventName().isEmpty() || !annotation.customEventDetail().isEmpty();
  }

  private static boolean isConfirmationTextNeeded(io.mateu.uidl.annotations.Action annotation) {
    return !annotation.confirmationText().isEmpty()
        || !annotation.confirmationMessage().isEmpty()
        || !annotation.confirmationTitle().isEmpty()
        || !annotation.confirmationDenialText().isEmpty();
  }
}
