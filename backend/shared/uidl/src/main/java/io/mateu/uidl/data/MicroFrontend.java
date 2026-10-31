package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * Embeds a UI served from another backend ({@code baseUrl}) or route inside the current page.
 *
 * <p>{@code resolve} says who asks the remote for its first paint: the renderer ({@link
 * Resolve#CLIENT}, the default) or the host while it builds the view ({@link Resolve#SERVER}, which
 * needs {@code baseUrl} under a registered remote — see {@link
 * io.mateu.uidl.remote.RemoteDescriptor}). {@code timeoutMs} is how long the host waits for it
 * (null = the remote's default).
 */
@Builder
public record MicroFrontend(
    String baseUrl,
    String route,
    String consumedRoute,
    String style,
    String cssClasses,
    String serverSideType,
    Object appState,
    String actionId,
    @Experimental Resolve resolve,
    @Experimental Integer timeoutMs)
    implements Component {

  /** The micro frontend as it was before {@code resolve}: resolved by the renderer. */
  public MicroFrontend(
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

  /** Whether the host resolves it ({@link Resolve#SERVER}). */
  public boolean resolvedByServer() {
    return resolve == Resolve.SERVER;
  }
}
