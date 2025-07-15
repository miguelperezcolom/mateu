package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * UI increment. Components to be added / replacements / actions to run
 *
 * @param commands List of command to run in the frontend
 * @param messages List of messages to be shown in the UI
 * @param fragments List of new UI fragments
 */
@Builder
public record UIIncrementDto(
    List<UICommandDto> commands,
    List<MessageDto> messages,
    List<UIFragmentDto> fragments,
    Object appData,
    Object appState) {

  public UIIncrementDto {
    commands = Collections.unmodifiableList(commands != null ? commands : List.of());
    messages = Collections.unmodifiableList(messages != null ? messages : List.of());
    fragments = Collections.unmodifiableList(fragments != null ? fragments : List.of());
  }

  @Override
  public List<MessageDto> messages() {
    return Collections.unmodifiableList(messages);
  }

  @Override
  public List<UICommandDto> commands() {
    return Collections.unmodifiableList(commands);
  }

  public List<UIFragmentDto> fragments() {
    return Collections.unmodifiableList(fragments);
  }
}
