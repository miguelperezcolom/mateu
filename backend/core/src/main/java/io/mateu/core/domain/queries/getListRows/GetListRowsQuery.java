package io.mateu.core.domain.queries.getListRows;

import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.SortCriteria;
import java.util.List;
import java.util.Map;
import lombok.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetListRowsQuery {

  private JourneyContainer journeyContainer;

  private String stepId;

  private String componentId;

  private String listId;

  private Map<String, Object> filters;

  private int page;

  private int pageSize;

  private List<SortCriteria> ordering;

  private ServerHttpRequest serverHttpRequest;
}
