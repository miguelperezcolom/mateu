package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

/**
 * An application-level context selector: a widget on the app header that fixes a value for EVERY
 * screen of the app (the active hotel, the company, the fiscal year…). The chosen option's value is
 * stored under {@code fieldName} in the app state, travels with every request, and is read
 * server-side via {@code HttpRequest.appContext(fieldName)}.
 */
@Builder
public record AppContextSelectorDto(
    String fieldName,
    String label,
    List<OptionDto> options,
    /**
     * Where the options come from instead (a data-authored shell's {@code optionsSource:}): a REST
     * source the browser fetches — through the server's {@code _appsource} action when proxied.
     */
    RestDataSourceDto optionsSource) {

  public AppContextSelectorDto {
    options = Collections.unmodifiableList(options != null ? options : List.of());
  }
}
