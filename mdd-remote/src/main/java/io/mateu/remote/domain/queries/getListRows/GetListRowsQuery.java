package io.mateu.remote.domain.queries.getListRows;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetListRowsQuery {

    private String journeyTypeId;

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;

    private Map<String, Object> filters;

    private int page;

    private int pageSize;

    private List<SortCriteria> ordering;

    private ServerHttpRequest serverHttpRequest;

}
