package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ActionDto;
import io.mateu.dtos.ConfirmationTextsDto;
import io.mateu.dtos.CustomEventDto;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ConfirmationTexts;

final class ActionDtoMapper {

  static ActionDto mapToAction(io.mateu.uidl.annotations.Action annotation) {
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
        .shortcut(annotation.shortcut().isEmpty() ? null : annotation.shortcut())
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
