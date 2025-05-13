package io.mateu.dtos;

/**
 * A button
 *
 * @param id This action targetId
 * @param icon Icon to be used
 * @param caption Button text
 * @param type Action type: primary, secondary
 * @param visible If this button is visible
 * @param validationRequired If validation of the form is required for firing this action
 * @param confirmationRequired If confirmation of the form is required for firing this action
 * @param rowsSelectedRequired If rows selected from the crud is required for firing this action
 * @param confirmationTexts Confirmation dialog text
 * @param target Target for this action: modal, new tab, ...
 * @param modalStyle The value for the dialog style attribute
 * @param modalTitle The value for the dialog header
 * @param customEvent In case a browser custom event is to be thrown
 * @param href The location to go to, in case we want this to act as a link
 * @param runOnEnter Set to true if you want to add a shortcut on Enter key
 * @param position Position in the action bar. Can be left or right
 * @param timeoutMillis Run this action automatically after a timeout
 * @param order Preferred order inside the actions list
 */
public record ActionDto(
    String id,
    String icon,
    String caption,
    ActionTypeDto type,
    ActionStereotypeDto stereotype,
    ActionThemeVariantDto[] variants,
    boolean visible,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTextsDto confirmationTexts,
    ActionTargetDto target,
    String modalStyle,
    String modalTitle,
    String customEvent,
    String href,
    boolean runOnEnter,
    ActionPositionDto position,
    int timeoutMillis,
    int order) {}
