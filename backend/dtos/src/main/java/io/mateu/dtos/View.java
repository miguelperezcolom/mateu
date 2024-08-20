package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record View(
    List<Message> messages,
    ViewPart header,
    ViewPart left,
    ViewPart main,
    ViewPart right,
    ViewPart footer) {

  public View {
    messages = Collections.unmodifiableList(messages);
  }

  @Override
  public List<Message> messages() {
    return Collections.unmodifiableList(messages);
  }
}
