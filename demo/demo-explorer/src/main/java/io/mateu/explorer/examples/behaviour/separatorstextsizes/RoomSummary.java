package io.mateu.explorer.examples.behaviour.separatorstextsizes;

import io.mateu.uidl.annotations.SeparatorBefore;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.TextSize;

/**
 * {@code @Text} renders a field's VALUE as text — a caption driven by the state — in a size ({@code
 * xl … xs}) and container ({@code h3}, {@code p}…); {@code noMargins} drops the block margins.
 * {@code @SeparatorBefore} draws a full-width line above a field, to split groups inside one
 * section without starting another.
 */
@Title("Room 214")
public class RoomSummary {

  @Text(container = TextContainer.h3, size = TextSize.xl)
  String headline = "Sea-view double";

  @Text(size = TextSize.xs, noMargins = true)
  String caption = "Last cleaned today at 11:20";

  String guest = "Ada Lovelace";

  String nights = "4";

  @SeparatorBefore String minibar = "Restocked";

  String housekeeping = "Turndown at 19:00";
}
