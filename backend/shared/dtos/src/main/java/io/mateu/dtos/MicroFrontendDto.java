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
 * @param chrome {@code NONE}, {@code COMPACT} or {@code PAGE} when it is EMBEDDED in this page: the
 *     renderer applies no window commands from it (title, history, favicon), draws no breadcrumb
 *     for it, hides its page header ({@code NONE}) or the header's title ({@code COMPACT}), and
 *     marks its requests ({@code RunActionRqDto.embeddedChrome}) so its server sends none of those
 *     commands. Absent = a top-level micro frontend, the shape before.
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
    @JsonIgnore ServerResolutionDto server,
    @JsonInclude(JsonInclude.Include.NON_NULL) String chrome)
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
        null,
        null);
  }

  /** A micro frontend before {@code chrome} (a top-level one). */
  public MicroFrontendDto(
      String baseUrl,
      String route,
      String consumedRoute,
      String style,
      String cssClasses,
      String serverSideType,
      Object appState,
      String actionId,
      UIIncrementDto resolved,
      ServerResolutionDto server) {
    this(
        baseUrl,
        route,
        consumedRoute,
        style,
        cssClasses,
        serverSideType,
        appState,
        actionId,
        resolved,
        server,
        null);
  }

  /** Whether it is embedded in the page (a chrome is set), not a top-level page. */
  @JsonIgnore
  public boolean embedded() {
    return chrome != null && !chrome.isBlank();
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
        null,
        chrome);
  }

  /**
   * The same micro frontend for the renderer to resolve, exactly as with {@code resolve = CLIENT}.
   */
  public MicroFrontendDto forClient() {
    return new MicroFrontendDto(
        baseUrl,
        route,
        consumedRoute,
        style,
        cssClasses,
        serverSideType,
        appState,
        actionId,
        null,
        null,
        chrome);
  }
}
