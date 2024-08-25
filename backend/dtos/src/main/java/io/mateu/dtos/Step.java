package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/**
 * An step in the journey. It contains the whole screen view
 *
 * @param id Step id
 * @param name Step name. Used to visualize a name when creating a link to this step
 * @param type Step type
 * @param view The view
 * @param previousStepId Previous step id. Can be empty
 * @param target Where to show this step. E.g. a new modal
 * @param components All the componentIds by id
 */
public record Step(
    String id,
    String name,
    String type,
    View view,
    String previousStepId,
    String target,
    Map<String, Component> components) {

  public Step {
    components = Collections.unmodifiableMap(components);
  }

  @Override
  public Map<String, Component> components() {
    return Collections.unmodifiableMap(components);
  }
}
