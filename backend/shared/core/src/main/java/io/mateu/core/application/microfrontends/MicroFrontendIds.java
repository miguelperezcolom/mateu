package io.mateu.core.application.microfrontends;

import io.mateu.dtos.MicroFrontendDto;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * The id of the context a renderer hosts a micro frontend in — the same formula as the web's {@code
 * microFrontendUxId} and Redwood's {@code microFrontendOf}. The host loads the remote AS that
 * context ({@code initiatorComponentId}), so the fragments it embeds target the island the renderer
 * will host them in.
 */
public final class MicroFrontendIds {

  private MicroFrontendIds() {}

  public static String of(MicroFrontendDto microFrontend) {
    return "mfe_"
        + Stream.of(
                microFrontend.baseUrl(),
                microFrontend.route(),
                microFrontend.consumedRoute(),
                microFrontend.serverSideType())
            .map(part -> part == null ? "" : part)
            .collect(Collectors.joining("|"))
            .replaceAll("[^a-zA-Z0-9]", "_");
  }
}
