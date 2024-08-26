package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * UI increment. Components to be added / replacements / actions to run
 *
 * @param commands List of command to run in the frontend
 * @param content New content
 * @param messages List of messages to be shown in the UI
 * @param components List of new components
 */
public record UIIncrement(
        List<UICommand> commands,
        Content content,
        List<Message> messages,
        Map<String, Component> components
) {

  public UIIncrement {
    commands = Collections.unmodifiableList(commands);
    messages = Collections.unmodifiableList(messages);
    components = Collections.unmodifiableMap(components);
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
  public Map<String, Component> components() {
    return Collections.unmodifiableMap(components);
  }
}
