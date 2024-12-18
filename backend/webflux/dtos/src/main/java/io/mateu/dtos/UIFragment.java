package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/**
 * UI update
 *
 * @param target Where to place this content
 * @param targetId The target id
 * @param content New content
 * @param components List of new components
 */
public record UIFragment(
    ActionTarget target,
    String targetId,
    String modalStyle,
    String modalTitle,
    Content content,
    Map<String, Component> components) {

  public UIFragment {
    components = Collections.unmodifiableMap(components);
  }

  @Override
  public Map<String, Component> components() {
    return Collections.unmodifiableMap(components);
  }
}
