package io.mateu.remote.domain.queries.getJourneyTypes;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.application.NotFoundException;
import io.mateu.remote.domain.mappers.UIMapper;
import io.mateu.remote.domain.UIRegistry;
import io.mateu.remote.dtos.JourneyType;
import io.mateu.remote.dtos.Menu;
import io.mateu.remote.dtos.UI;
import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Builder
@Slf4j
@Getter
public class GetJourneyTypesQuery {

    private final String uiId;

    public GetJourneyTypesQuery(String uiId) {
        this.uiId = uiId;
    }

}
