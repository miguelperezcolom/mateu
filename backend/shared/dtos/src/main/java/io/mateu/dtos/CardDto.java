package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * Card metadata
 *
 * @param layout The layout to be used to paint this card
 * @param thumbnail The thumbnail for this card. An icon
 * @param buttons List of buttons to show
 * @param icons List of icons to show
 */
public record CardDto(
    CardLayoutDto layout,
    String thumbnail,
    List<ActionDto> buttons,
    List<ActionDto> icons,
    ServerSideObjectDto actionHandler)
    implements ComponentMetadataDto {

  public CardDto {
    buttons = Collections.unmodifiableList(buttons);
    icons = Collections.unmodifiableList(icons);
  }

  @Override
  public List<ActionDto> buttons() {
    return Collections.unmodifiableList(buttons);
  }

  @Override
  public List<ActionDto> icons() {
    return Collections.unmodifiableList(icons);
  }
}
