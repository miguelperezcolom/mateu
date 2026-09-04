package io.mateu.uidl.fluent;

import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonColor;
import io.mateu.uidl.data.ButtonSize;
import io.mateu.uidl.data.ButtonStyle;

/**
 * Builds the {@link Action} and the {@link Button} of a toolbar method declared by a PLACEMENT
 * annotation ({@code @ListToolbarButton}, {@code @ViewToolbarButton}).
 *
 * <p>Three annotations, three jobs, no duplicated members: the placement annotation says WHICH
 * toolbar the button belongs to (a crud has two, so nothing else can say it), {@link Toolbar} says
 * how it LOOKS and {@link io.mateu.uidl.annotations.Action} how it BEHAVES — exactly the
 * composition a detail-view method already uses. Copying the {@code @Action}/{@code @Toolbar}
 * members into each placement annotation is what let them fall behind in the first place.
 *
 * <pre>{@code
 * @ListToolbarButton
 * @Toolbar(buttonStyle = ButtonStyle.secondary, buttonColor = ButtonColor.error)
 * @Action(confirmationRequired = true,
 *         confirmationMessage = "Cancelling stops every selected process. Continue?")
 * public void cancel(List<Process> selection) { ... }
 * }</pre>
 *
 * <p>The rule lives here and not at each call site because the crud listing, the crud detail view
 * and a declarative {@code Listing} all advertise the same button through different code paths.
 */
public final class ToolbarButtons {

  private ToolbarButtons() {}

  /**
   * The action a toolbar method advertises: the behaviour declared by {@code @Action} on the same
   * method (null when it declares none), re-identified as {@code actionId} and with the placement
   * annotation's own flags folded in.
   *
   * <p>The flags are OR-ed rather than overridden: both are opt-ins, and {@code @Action} defaults
   * {@code rowsSelectedRequired} to false while {@code @ListToolbarButton} defaults it to true — so
   * letting the {@code @Action} default win would silently disarm the selection guard of every bulk
   * button that adds an {@code @Action} for its confirmation text.
   *
   * <p>{@code @Action.id()} is ignored: the dispatch id belongs to the placement (a bulk method is
   * reached as {@code action-on-row-<method>}), not to the developer.
   */
  public static Action toolbarAction(
      String actionId,
      io.mateu.uidl.annotations.Action behaviour,
      boolean confirmationRequired,
      boolean rowsSelectedRequired) {
    var base = behaviour != null ? Action.of(behaviour) : Action.builder().build();
    return base.withId(actionId)
        .withConfirmationRequired(base.confirmationRequired() || confirmationRequired)
        .withRowsSelectedRequired(base.rowsSelectedRequired() || rowsSelectedRequired);
  }

  /**
   * The toolbar button itself, wearing the {@link Toolbar} appearance declared on the same method
   * ({@code none} means "unset", so the renderer keeps its default).
   */
  public static Button toolbarButton(String actionId, String label, Toolbar appearance) {
    var button = Button.builder().id(actionId).label(label).actionId(actionId);
    if (appearance != null) {
      button
          .buttonStyle(styleOf(appearance))
          .color(colorOf(appearance))
          .size(sizeOf(appearance))
          .separatorBefore(appearance.separatorBefore());
    }
    return button.build();
  }

  /** Declaration order for toolbar methods: {@code @Toolbar(order = N)}, 0 when undeclared. */
  public static int orderOf(Toolbar appearance) {
    return appearance != null ? appearance.order() : 0;
  }

  public static ButtonStyle styleOf(Toolbar appearance) {
    return appearance != null && appearance.buttonStyle() != ButtonStyle.none
        ? appearance.buttonStyle()
        : null;
  }

  public static ButtonColor colorOf(Toolbar appearance) {
    return appearance != null && appearance.buttonColor() != ButtonColor.none
        ? appearance.buttonColor()
        : null;
  }

  public static ButtonSize sizeOf(Toolbar appearance) {
    return appearance != null && appearance.buttonSize() != ButtonSize.none
        ? appearance.buttonSize()
        : null;
  }
}
