package io.mateu.dtos;

import lombok.Builder;

/**
 * A button
 *
 * @param id This action targetId
 * @param validationRequired If validation of the form is required for firing this action
 * @param confirmationRequired If confirmation of the form is required for firing this action
 * @param rowsSelectedRequired If rows selected from the crud is required for firing this action
 * @param confirmationTexts Confirmation dialog text
 * @param modalStyle The initialValue for the dialog style attribute
 * @param modalTitle The initialValue for the dialog header
 * @param customEvent In case a browser custom event is to be thrown
 * @param href The location to go to, in case we want this to act as a link
 */
@Builder
public record ActionDto(
    String id,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTextsDto confirmationTexts,
    String modalStyle,
    String modalTitle,
    String customEvent,
    String href,
    boolean background) {}
