package io.mateu.core.domain.uidefinition.core.interfaces;

import io.mateu.core.domain.uidefinition.shared.interfaces.ActionHandler;
import io.mateu.dtos.ServerSideObject;

import java.util.Collections;
import java.util.List;

public record Card(
    CardLayout layout,
    String thumbnail,
    String headerText,
    String subhead,
    String media,
    String supportingText,
    List<Button> buttons,
    List<CallableIcon> icons,
    ActionHandler actionHandler) {

  public Card(String headerText, String subhead, String supportingText) {
    this(CardLayout.Layout1, "", headerText, subhead, "", supportingText, List.of(), List.of(), null);
  }

  public Card {
    buttons = buttons != null ? Collections.unmodifiableList(buttons) : List.of();
    icons = icons != null ? Collections.unmodifiableList(icons) : List.of();
  }

  @Override
  public List<Button> buttons() {
    return Collections.unmodifiableList(buttons);
  }

  @Override
  public List<CallableIcon> icons() {
    return Collections.unmodifiableList(icons);
  }
}
