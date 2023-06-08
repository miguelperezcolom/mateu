package io.mateu.remote.domain.queries.getListCount;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.*;
import org.springframework.http.server.reactive.ServerHttpRequest;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
@Getter
public class GetListCountQuery {

    private String journeyTypeId;

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;

    private String filters;

    private ServerHttpRequest serverHttpRequest;

}
