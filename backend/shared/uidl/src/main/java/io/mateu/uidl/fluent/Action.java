package io.mateu.uidl.fluent;

import lombok.Builder;
import lombok.With;

@Builder
@With
public record Action(
    String id,
    boolean background,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTexts confirmationTexts,
    String modalStyle,
    String modalTitle,
    CustomEvent customEvent,
    String href,
    String js,
    boolean sse,
    String fieldsToValidate,
    boolean bubble,
    String shortcut,
    /** Client-side request ceiling in ms; 0 keeps the client default. */
    int timeoutMillis,
    /** Safe to re-send: the client may retry it on a transient failure. */
    boolean idempotent,
    /**
     * Client-side REST call instead of a server dispatch (@RestAction); null for normal actions.
     */
    io.mateu.uidl.data.RestAction restAction) {

  /**
   * The fluent action declared by an {@code @Action} annotation.
   *
   * <p>Lives here rather than in the wire mappers because it is a pure annotation-to-record reading
   * with no knowledge of the DTOs, and both the mappers and the {@code uidl} default methods that
   * advertise a toolbar method's behaviour need it (see {@link ToolbarButtons}).
   */
  public static Action of(io.mateu.uidl.annotations.Action annotation) {
    return Action.builder()
        .id(annotation.id())
        .validationRequired(annotation.validationRequired())
        .bubble(annotation.bubble())
        .fieldsToValidate(annotation.fieldsToValidate())
        .confirmationRequired(annotation.confirmationRequired())
        .rowsSelectedRequired(annotation.rowsSelectedRequired())
        .confirmationTexts(confirmationTextsOf(annotation))
        .modalStyle(annotation.modalStyle())
        .modalTitle(annotation.modalTitle())
        .customEvent(customEventOf(annotation))
        .href(annotation.href())
        .js(annotation.js())
        .background(annotation.background())
        .sse(annotation.sse())
        .shortcut(annotation.shortcut().isEmpty() ? null : annotation.shortcut())
        .timeoutMillis(annotation.timeoutMillis())
        .idempotent(annotation.idempotent())
        .build();
  }

  /**
   * Null unless the developer wrote at least one of the four texts — an all-blank record would make
   * the renderer paint an empty confirmation dialog instead of falling back to its own wording.
   */
  private static ConfirmationTexts confirmationTextsOf(io.mateu.uidl.annotations.Action a) {
    if (a.confirmationText().isEmpty()
        && a.confirmationMessage().isEmpty()
        && a.confirmationTitle().isEmpty()
        && a.confirmationDenialText().isEmpty()) {
      return null;
    }
    return ConfirmationTexts.builder()
        .title(a.confirmationTitle())
        .message(a.confirmationMessage())
        .confirmationText(a.confirmationText())
        .denialText(a.confirmationDenialText())
        .build();
  }

  private static CustomEvent customEventOf(io.mateu.uidl.annotations.Action a) {
    if (a.customEventName().isEmpty() && a.customEventDetail().isEmpty()) {
      return null;
    }
    return CustomEvent.builder()
        .eventName(a.customEventName())
        .detail(a.customEventDetail())
        .build();
  }
}
