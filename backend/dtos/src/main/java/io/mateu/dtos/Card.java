package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * Card metadata
 *
 * @param layout The layout to be used to paint this card
 * @param thumbnail The thumbnail for this card. An icon
 * @param headerText This card header text
 * @param subhead This card subtitle
 * @param media A media url
 * @param supportingText The card text
 * @param buttons List of buttons to show
 * @param icons List of icons to show
 */
public record Card(
        CardLayout layout,
        String thumbnail,
        String headerText,
        String subhead,
        String media,
        String supportingText,
        List<Action> buttons,
        List<Action> icons
)
    implements ComponentMetadata {

  public Card {
    buttons = Collections.unmodifiableList(buttons);
    icons = Collections.unmodifiableList(icons);
  }

  @Override
  public List<Action> buttons() {
    return Collections.unmodifiableList(buttons);
  }

  @Override
  public List<Action> icons() {
    return Collections.unmodifiableList(icons);
  }
}
