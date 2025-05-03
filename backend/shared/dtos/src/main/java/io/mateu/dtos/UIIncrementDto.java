package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * UI increment. Components to be added / replacements / actions to run
 *
 * @param commands List of command to run in the frontend
 * @param messages List of messages to be shown in the UI
 * @param uiFragments List of new UI fragments
 */
public record UIIncrementDto(
    List<UICommandDto> commands,
    List<MessageDto> messages,
    List<UIFragmentDto> uiFragments,
    Map<String, Object> appData) {

  public UIIncrementDto {
    commands = Collections.unmodifiableList(commands != null ? commands : List.of());
    messages = Collections.unmodifiableList(messages != null ? messages : List.of());
    uiFragments = Collections.unmodifiableList(uiFragments != null ? uiFragments : List.of());
    appData = Collections.unmodifiableMap(appData != null ? appData : Map.of());
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

  @Override
  public Map<String, Object> appData() {
    return Collections.unmodifiableMap(appData);
  }
}
