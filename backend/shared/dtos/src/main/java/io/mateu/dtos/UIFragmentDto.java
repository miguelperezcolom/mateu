package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/**
 * UI update
 *
 * @param root New content
 * @param components List of new components
 */
public record UIFragmentDto(
    SingleComponentDto root,
    Map<String, ComponentDto> components) {

  public UIFragmentDto {
    components = Collections.unmodifiableMap(components);
  }

  @Override
  public Map<String, ComponentDto> components() {
    return Collections.unmodifiableMap(components);
  }
}
