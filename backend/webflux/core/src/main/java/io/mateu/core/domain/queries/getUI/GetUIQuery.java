package io.mateu.core.domain.queries.getUI;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
public class GetUIQuery {

  private final String uiId;

  private final String baseUrl;

  public GetUIQuery(String uiId, String baseUrl) {
    this.uiId = uiId;
    this.baseUrl = baseUrl;
  }
}
