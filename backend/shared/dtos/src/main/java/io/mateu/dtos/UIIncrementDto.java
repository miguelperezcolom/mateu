package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * UI increment. Components to be added / replacements / actions to run
 *
 * @param commands List of command to run in the frontend
 * @param messages List of messages to be shown in the UI
 * @param uiFragments List of new UI fragments
 */
public record UIIncrementDto(
    List<UICommandDto> commands, List<MessageDto> messages, List<UIFragmentDto> uiFragments) {

  public UIIncrementDto {
    commands = Collections.unmodifiableList(commands);
    messages = Collections.unmodifiableList(messages);
    uiFragments = Collections.unmodifiableList(uiFragments);
  }

  @Override
  public List<MessageDto> messages() {
    return Collections.unmodifiableList(messages);
  }

  @Override
  public List<UICommandDto> commands() {
    return Collections.unmodifiableList(commands);
  }

  @Override
  public List<UIFragmentDto> uiFragments() {
    return Collections.unmodifiableList(uiFragments);
  }
}
