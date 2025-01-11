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
public record UIFragmentDto(
    ActionTargetDto target,
    String targetId,
    String initiatorComponentId,
    String modalStyle,
    String modalTitle,
    ContentDto content,
    Map<String, ComponentDto> components) {

  public UIFragmentDto {
    components = Collections.unmodifiableMap(components);
  }

  @Override
  public Map<String, ComponentDto> components() {
    return Collections.unmodifiableMap(components);
  }
}
