package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.Map;
import lombok.Builder;

/**
 * A kanban board: columns of cards. Cards may carry an {@code actionId} so clicking one dispatches
 * the standard {@code action-requested} event. Design-system neutral (rendered with Lumo CSS vars +
 * fallbacks), so every renderer that claims the type shows it.
 *
 * <p>When {@code moveActionId} is set, cards can be dragged to another column or to another place
 * in their own (and moved from the keyboard with a "Move to…" menu). Dropping one runs that action
 * with the card's row (when it came from {@code rowsSource}) plus {@code parameters._cardId},
 * {@code _fromColumnId}, {@code _toColumnId} and {@code _toIndex} (its position in the target
 * column). The renderer moves the card at once and puts it back when the action fails.
 *
 * <p>A board can also be LIVE instead of carrying its cards: {@code rowsSource} names a REST source
 * whose items become cards — each placed in the declared column whose id equals the item's {@code
 * columnField} (default {@code status}), drawn from the {@code card} template ({@code ${row.x}} in
 * any of its texts), coloured by {@code cardColors} when the card's colour names one of its keys,
 * and opening {@code cardRoute} ({@code tasks/${row.id}}) when clicked. After a successful move the
 * source is read again.
 */
@Builder
public record Kanban(
    String id,
    List<KanbanColumn> columns,
    String style,
    String cssClasses,
    /** Action run when a card is dropped; null = the cards do not move. */
    @Experimental("kanban drag and drop (3.0-beta)") String moveActionId,
    /** The REST source whose items are the board's cards (a live board). */
    @Experimental("kanban drag and drop (3.0-beta)") RestDataSource rowsSource,
    /** The item field naming the card's column (default {@code status}). */
    @Experimental("kanban drag and drop (3.0-beta)") String columnField,
    /** Template of a card drawn from an item: {@code ${row.x}} in its texts. */
    @Experimental("kanban drag and drop (3.0-beta)") KanbanCard card,
    /** A card colour that names a key here takes its value ({@code urgent: "#dc2626"}). */
    @Experimental("kanban drag and drop (3.0-beta)") Map<String, String> cardColors,
    /** Where a card from {@code rowsSource} goes when clicked ({@code tasks/${row.id}}). */
    @Experimental("kanban drag and drop (3.0-beta)") String cardRoute)
    implements Component {

  public Kanban(String id, List<KanbanColumn> columns, String style, String cssClasses) {
    this(id, columns, style, cssClasses, null, null, null, null, null, null);
  }
}
