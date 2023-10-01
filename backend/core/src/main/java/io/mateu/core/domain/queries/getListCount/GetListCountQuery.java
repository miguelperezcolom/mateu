package io.mateu.core.domain.queries.getListCount;

import java.util.Map;
import lombok.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetListCountQuery {

  private String journeyTypeId;

  private String journeyId;

  private String stepId;

  private String componentId;

  private String listId;

  private Map<String, Object> filters;

  private ServerHttpRequest serverHttpRequest;
}
