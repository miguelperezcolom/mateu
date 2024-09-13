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
public record UIIncrement(
    List<UICommand> commands,
    List<Message> messages,
    List<UIFragment> uiFragments) {

  public UIIncrement {
    commands = Collections.unmodifiableList(commands);
    messages = Collections.unmodifiableList(messages);
    uiFragments = Collections.unmodifiableList(uiFragments);
  }

  @Override
  public List<Message> messages() {
    return Collections.unmodifiableList(messages);
  }

  @Override
  public List<UICommand> commands() {
    return Collections.unmodifiableList(commands);
  }

  @Override
  public List<UIFragment> uiFragments() {
    return Collections.unmodifiableList(uiFragments);
  }

}
