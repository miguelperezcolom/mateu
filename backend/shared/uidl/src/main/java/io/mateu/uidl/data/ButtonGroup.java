package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import java.util.List;
import lombok.Builder;

/**
 * A group of buttons shown together: a dropdown — one trigger labelled {@code label} opening its
 * {@code buttons} — or, when it has a {@code primary}, a SPLIT button: the primary action runs from
 * the button itself and an adjacent ▾ opens the other {@code buttons} (the group's {@code label} is
 * not drawn then). It sits wherever a button does: page toolbars, a form's buttons, listing
 * toolbars and content.
 *
 * <pre>{@code
 * ButtonGroup.of("Export", new Button("CSV", "exportCsv"), new Button("PDF", "exportPdf"));
 * ButtonGroup.split(new Button("Save", "save"), new Button("Save as draft", "saveDraft"));
 * }</pre>
 */
@Builder
public record ButtonGroup(
    String id,
    String label,
    String iconOnLeft,
    String iconOnRight,
    boolean separatorBefore,
    List<Button> buttons,
    /**
     * The action the button itself runs: set, the group is a SPLIT button (the primary + a ▾ with
     * the other {@code buttons}); null, a dropdown whose trigger only opens the menu.
     */
    Button primary)
    implements Component, UserTrigger {

  /** The dropdown form (no primary) — the constructor this record had before split buttons. */
  public ButtonGroup(
      String id,
      String label,
      String iconOnLeft,
      String iconOnRight,
      boolean separatorBefore,
      List<Button> buttons) {
    this(id, label, iconOnLeft, iconOnRight, separatorBefore, buttons, null);
  }

  /** A dropdown: one trigger labelled {@code label} opening {@code buttons}. */
  public static ButtonGroup of(String label, Button... buttons) {
    return new ButtonGroup(null, label, null, null, false, List.of(buttons), null);
  }

  /** A split button: {@code primary} runs from the button, the ▾ opens {@code more}. */
  public static ButtonGroup split(Button primary, Button... more) {
    return new ButtonGroup(null, null, null, null, false, List.of(more), primary);
  }
}
