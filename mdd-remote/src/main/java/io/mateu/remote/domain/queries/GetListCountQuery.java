package io.mateu.remote.domain.queries;

import lombok.*;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class GetListCountQuery {

    private String journeyId;

    private String stepId;

    private String componentId;

    private String listId;


    private Map<String, Object> filters;

    public long run() throws Exception {
        return 0;
    }

}
