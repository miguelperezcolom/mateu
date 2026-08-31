package io.mateu.dtos;

import java.util.Collections;
import java.util.Map;

/**
 * One named entry of the app's REST source catalogue, as it travels to the renderer.
 *
 * <p>A surface referencing a source carries only its NAME ({@link RestDataSourceDto#ref()}); the
 * endpoint itself travels once, here. That is what keeps the same endpoint from being repeated in
 * every screen that consumes it, and what lets a statically deployed bundle be re-pointed at
 * another environment by editing one entry of its manifest instead of being rebuilt.
 *
 * @param name what a {@link RestDataSourceDto#ref()} matches
 * @param source how to reach the endpoint
 * @param fields the fields this source exposes, as {@code name -> dot path} into each item; a name
 *     absent from the map is read as its own path
 * @param totalPath a dot path to the total number of matching items for a server-paged endpoint;
 *     blank means the response carries no total
 * @param provenance {@code "generate"} when this project owes the endpoint, {@code "existing"} when
 *     somebody else already serves it. The renderer ignores it — it is carried because the same
 *     catalogue feeds the derived API contract, which needs to know what to generate a server for.
 * @param description a line for humans, and the summary of the derived operation
 */
public record RestSourceEntryDto(
    String name,
    RestDataSourceDto source,
    Map<String, String> fields,
    String totalPath,
    String provenance,
    String description) {

  public RestSourceEntryDto {
    fields = Collections.unmodifiableMap(fields != null ? fields : Map.of());
  }
}
