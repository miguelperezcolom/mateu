package io.mateu.remote.domain.queries;

import io.mateu.remote.dtos.SortCriteria;
import lombok.*;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetListRowsQuery {

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;


    private Map<String, Object> filters;

    private int page;

    private int pageSize;

    private List<SortCriteria> ordering;

    public List<Map<String, Object>> run() throws Exception {
        return List.of(
                Map.of("name", "Mateu", "age", 14),
                Map.of("name", "Antonia", "age", 47)
        );
    }


}
