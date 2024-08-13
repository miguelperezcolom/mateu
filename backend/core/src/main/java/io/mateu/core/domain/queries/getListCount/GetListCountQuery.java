package io.mateu.core.domain.queries.getListCount;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import lombok.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class GetListCountQuery {

  private JourneyContainer journeyContainer;

  private String stepId;

  private String componentId;

  private String listId;

  private Map<String, Object> filters;

  private ServerHttpRequest serverHttpRequest;
}
