package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

public record CrudComponentDto(
    ComponentMetadataDto metadata,
    String id,
    String className,
    Map<String, Object> attributes,
    Object data,
    List<String> childComponentIds,
    Map<String, Object> lastUsedFilters,
    List<SortCriteriaDto> lastUsedSorting)
    implements ComponentDto {

  public CrudComponentDto {
    lastUsedFilters =
        lastUsedFilters != null ? Collections.unmodifiableMap(lastUsedFilters) : Map.of();
    lastUsedSorting =
        lastUsedSorting != null ? Collections.unmodifiableList(lastUsedSorting) : List.of();
    attributes = Collections.unmodifiableMap(attributes);
    childComponentIds = Collections.unmodifiableList(childComponentIds);
  }

  @Override
  public Map<String, Object> lastUsedFilters() {
    return Collections.unmodifiableMap(lastUsedFilters);
  }

  @Override
  public List<SortCriteriaDto> lastUsedSorting() {
    return Collections.unmodifiableList(lastUsedSorting);
  }

  @Override
  public Map<String, Object> attributes() {
    return Collections.unmodifiableMap(attributes);
  }

  @Override
  public List<String> childComponentIds() {
    return Collections.unmodifiableList(childComponentIds);
  }
}
