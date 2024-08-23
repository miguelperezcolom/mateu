package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * A component inside a view part/layout. E.g. form, card, directory, stepper, ...
 * There is a specific implementation for cruds
 *
 * @param metadata The metadata to be used to paint the component
 * @param id The component id
 * @param attributes Attributes for this component. Not data, but to be used to change this component behaviour/appearance
 * @param data Pure data for this component
 * @param childComponentIds Child componentIds. This is used for layouts
 */
public record GenericComponent(
        ComponentMetadata metadata, String id, Map<String, Object> attributes, Map<String, Object> data, List<String> childComponentIds) implements Component {

  public GenericComponent {
    attributes = Collections.unmodifiableMap(attributes);
    data = Collections.unmodifiableMap(data);
    childComponentIds = Collections.unmodifiableList(childComponentIds);
  }

  @Override
  public Map<String, Object> attributes() {
    return Collections.unmodifiableMap(attributes);
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public List<String> childComponentIds() {
    return Collections.unmodifiableList(childComponentIds);
  }
}
