package io.mateu.core.domain.queries.getJourneyTypes;

import lombok.Builder;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Builder
@Slf4j
@Getter
public class GetJourneyTypesQuery {

  private final String uiId;

  public GetJourneyTypesQuery(String uiId) {
    this.uiId = uiId;
  }
}
