package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public record CrudComponent(
    ComponentMetadata metadata,
    String id,
    String className,
    Map<String, Object> attributes,
    Map<String, Object> data,
    List<String> childComponentIds,
    Map<String, Object> lastUsedFilters,
    List<SortCriteria> lastUsedSorting)
    implements Component {

  public CrudComponent {
    lastUsedFilters =
        lastUsedFilters != null ? Collections.unmodifiableMap(lastUsedFilters) : Map.of();
    lastUsedSorting =
        lastUsedSorting != null ? Collections.unmodifiableList(lastUsedSorting) : List.of();
    attributes = Collections.unmodifiableMap(attributes);
    data = Collections.unmodifiableMap(data);
    childComponentIds = Collections.unmodifiableList(childComponentIds);
  }

  @Override
  public Map<String, Object> lastUsedFilters() {
    return Collections.unmodifiableMap(lastUsedFilters);
  }

  @Override
  public List<SortCriteria> lastUsedSorting() {
    return Collections.unmodifiableList(lastUsedSorting);
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
