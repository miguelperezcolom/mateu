package io.mateu.remote.domain.queries.getUI;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Builder
@Slf4j
@Getter
public class GetUIQuery {

    private final String uiId;

    public GetUIQuery(String uiId) {
        this.uiId = uiId;
    }

}
