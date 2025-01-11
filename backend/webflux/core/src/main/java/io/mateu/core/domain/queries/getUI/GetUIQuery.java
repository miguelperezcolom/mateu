package io.mateu.core.domain.queries.getUI;

import java.util.Map;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
public class GetUIQuery {

  private final String uiId;

  private final String baseUrl;

  private final Map<String, Object> contextData;

  public GetUIQuery(String uiId, String baseUrl, Map<String, Object> contextData) {
    this.uiId = uiId;
    this.baseUrl = baseUrl;
    this.contextData = contextData;
  }
}
