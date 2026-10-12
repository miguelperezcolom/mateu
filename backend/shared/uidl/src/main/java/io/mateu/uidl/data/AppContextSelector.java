package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import java.util.List;
import lombok.Builder;

/**
 * An application context picker on the app header, authored as data — the twin of an {@code
 * AppContext} field of an {@code App} class. The picked value is kept by the browser and travels in
 * the app state of every request under {@code fieldName} (read on a Java server with {@code
 * HttpRequest.appContext(fieldName)}).
 *
 * @param fieldName the app-state key the picked value is stored under
 * @param label what the picker is called ("Hotel")
 * @param options the static choices (value/label)
 * @param optionsSource where to fetch the choices instead: a REST source (usually a {@code
 *     sources.yaml} reference), read with its {@code itemsPath}/{@code valuePath}/{@code labelPath}
 *     — by the browser for a direct source, through the server for a proxied one
 */
@Builder
@Experimental("YAML app shell extras (3.0 beta)")
public record AppContextSelector(
    String fieldName, String label, List<Option> options, RestDataSource optionsSource) {

  public AppContextSelector {
    options = options != null ? options : List.of();
  }
}
