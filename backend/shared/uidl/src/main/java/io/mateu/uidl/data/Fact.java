package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

/**
 * One key fact of an {@link EntityHeader}: a small-caps {@code label} over its {@code value} (e.g.
 * {@code "TOTAL RESERVA"} / {@code "€ 4.890,00"}).
 *
 * <p>A fact can carry ONE optional action: with an {@code actionId}, the renderers draw a compact
 * icon-only button right after the value (e.g. a pencil next to {@code "EMPRESA"} / {@code "Acme
 * Corporation Ltd"} that opens a drawer to change it). The click dispatches {@code actionId} with
 * {@code parameters} exactly like a {@link Button} does, so it reaches the action method (or the
 * {@code handleAction}) of the view that owns the header.
 *
 * @param label the small-caps label
 * @param value the value under it
 * @param actionId the action the fact's button dispatches; {@code null} = no button
 * @param icon the button's icon (a {@code vaadin:*} token); a pencil when {@code null}
 * @param actionLabel the button's accessible name and tooltip (e.g. "Cambiar empresa"); the fact's
 *     label when {@code null}
 * @param parameters sent with the action, like a {@link Button}'s parameters
 */
@Builder
public record Fact(
    String label,
    String value,
    String actionId,
    String icon,
    String actionLabel,
    Map<String, Object> parameters) {

  /** A display-only fact: a label over its value, no action. */
  public Fact(String label, String value) {
    this(label, value, null, null, null, null);
  }
}
