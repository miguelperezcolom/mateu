package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A view
 *
 * @param messages List of messages to be shown
 * @param header Header content
 * @param left Left aside content
 * @param main Main content
 * @param right Right aside content
 * @param footer Footer content
 */
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
