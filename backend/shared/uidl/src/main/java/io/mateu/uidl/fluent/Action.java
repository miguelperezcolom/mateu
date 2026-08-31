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
    io.mateu.uidl.data.RestAction restAction) {}
