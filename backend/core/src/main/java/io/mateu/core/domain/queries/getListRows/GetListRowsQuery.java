package io.mateu.core.domain.queries.getListRows;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.uidefinition.shared.interfaces.SortCriteria;
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
