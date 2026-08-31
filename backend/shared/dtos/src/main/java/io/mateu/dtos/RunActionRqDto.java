package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.Collections;
import java.util.Map;
import lombok.Builder;

/**
 * The inbound wire request. Unknown properties are IGNORED because federation puts two independent
 * deployments on this contract: a shell built against a newer Mateu sends fields (the last one
 * added was {@code knownStructureHash}) that an older service has never heard of. Rejecting them
 * makes the remote answer HTTP 400 to the shell's server-to-server call — which is exactly the
 * deep-link path, so the screen works through the menu (the browser talks to the remote directly,
 * with its own older-shaped request) and fails by URL.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
@Builder
public record RunActionRqDto(
    Map<String, Object> componentState,
    Map<String, Object> appState,
    Map<String, Object> parameters,
    String initiatorComponentId,
    String consumedRoute,
    String actionId,
    String route,
    String serverSideType,
    String serverSideComponentRoute,
    /**
     * The structure hash (ETag) the client currently holds for this route's component, from its
     * client-side structure cache. When it matches the hash of the structure the server would send,
     * the server OMITS the component from the response (sending only state/data) so the client
     * reuses its cached structure. Null for clients that don't cache (old clients / cache miss),
     * which always get the full structure. See {@code ServerSideComponentDto.structureHash}.
     */
    String knownStructureHash) {

  public RunActionRqDto {
    componentState =
        componentState != null ? Collections.unmodifiableMap(componentState) : Map.of();
    appState = appState != null ? Collections.unmodifiableMap(appState) : Map.of();
  }

  public Map<String, Object> componentState() {
    return Collections.unmodifiableMap(componentState);
  }

  public Map<String, Object> appState() {
    return Collections.unmodifiableMap(appState);
  }
}
