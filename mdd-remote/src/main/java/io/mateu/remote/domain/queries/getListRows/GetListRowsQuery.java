package io.mateu.remote.domain.queries.getListRows;

import io.mateu.mdd.shared.interfaces.Listing;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.domain.store.JourneyStoreService;
import lombok.*;

import java.util.List;

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

    private String filters;

    private int page;

    private int pageSize;

    private List<SortCriteria> ordering;

}
