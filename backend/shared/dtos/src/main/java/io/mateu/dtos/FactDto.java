package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;
import lombok.Builder;

/**
 * One label-over-value fact of an entity header. The action members are optional and OMITTED from
 * the JSON when absent, so a display-only fact keeps its {@code {"label", "value"}} wire: with an
 * {@code actionId} the renderers draw an icon-only button after the value that dispatches it with
 * {@code parameters}, like a button.
 */
@Builder
public record FactDto(
    String label,
    String value,
    @JsonInclude(JsonInclude.Include.NON_NULL) String actionId,
    @JsonInclude(JsonInclude.Include.NON_NULL) String icon,
    @JsonInclude(JsonInclude.Include.NON_NULL) String actionLabel,
    @JsonInclude(JsonInclude.Include.NON_EMPTY) Map<String, Object> parameters) {

  /** A display-only fact. */
  public FactDto(String label, String value) {
    this(label, value, null, null, null, null);
  }
}
