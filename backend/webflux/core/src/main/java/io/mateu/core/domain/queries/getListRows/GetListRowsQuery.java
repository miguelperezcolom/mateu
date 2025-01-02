package io.mateu.core.domain.queries.getListRows;

import io.mateu.dtos.SortCriteriaDto;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public record GetListRowsQuery(
    String componentType,
    Map<String, Object> data,
    ServerHttpRequest serverHttpRequest,
    String searchText,
    Map<String, Object> filters,
    int page,
    int pageSize,
    List<SortCriteriaDto> ordering) {

  public GetListRowsQuery {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
    filters = filters != null ? Collections.unmodifiableMap(filters) : Map.of();
    ordering = ordering != null ? Collections.unmodifiableList(ordering) : Collections.emptyList();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public Map<String, Object> filters() {
    return Collections.unmodifiableMap(filters);
  }

  @Override
  public List<SortCriteriaDto> ordering() {
    return Collections.unmodifiableList(ordering);
  }
}
