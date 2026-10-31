package io.mateu.dtos;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Another Mateu UI embedded in this one: the renderer hosts it in its own context, which loads from
 * {@code baseUrl} and sends its actions there.
 *
 * @param resolved the remote's answer to the load, when the HOST resolved it while building this
 *     response ({@code resolve = SERVER}): the renderer paints it instead of asking the remote, and
 *     everything after the first paint (actions, triggers) still goes to {@code baseUrl}. Absent
 *     when the renderer has to ask for it — the shape every micro frontend had before.
 * @param server what the host needs to resolve it; never on the wire
 */
public record MicroFrontendDto(
    String baseUrl,
    String route,
    String consumedRoute,
    String style,
    String cssClasses,
    String serverSideType,
    Object appState,
    String actionId,
    @JsonInclude(JsonInclude.Include.NON_NULL) UIIncrementDto resolved,
    @JsonIgnore ServerResolutionDto server)
    implements ComponentMetadataDto {

  /** A micro frontend the renderer resolves (the shape before server resolution). */
  public MicroFrontendDto(
      String baseUrl,
      String route,
      String consumedRoute,
      String style,
      String cssClasses,
      String serverSideType,
      Object appState,
      String actionId) {
    this(
        baseUrl,
        route,
        consumedRoute,
        style,
        cssClasses,
        serverSideType,
        appState,
        actionId,
        null,
        null);
  }

  /** The same micro frontend with the remote's answer embedded, and nothing left to resolve. */
  public MicroFrontendDto embedding(UIIncrementDto answer) {
    return new MicroFrontendDto(
        baseUrl,
        route,
        consumedRoute,
        style,
        cssClasses,
        serverSideType,
        appState,
        actionId,
        answer,
        null);
  }

  /**
   * The same micro frontend for the renderer to resolve, exactly as with {@code resolve = CLIENT}.
   */
  public MicroFrontendDto forClient() {
    return new MicroFrontendDto(
        baseUrl, route, consumedRoute, style, cssClasses, serverSideType, appState, actionId);
  }
}
