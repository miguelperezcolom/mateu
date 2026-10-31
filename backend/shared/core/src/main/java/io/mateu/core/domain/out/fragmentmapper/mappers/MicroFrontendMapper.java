package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MicroFrontendDto;
import io.mateu.dtos.ServerResolutionDto;
import io.mateu.dtos.TextContainerDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.data.ContentSlot;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

public class MicroFrontendMapper {

  /**
   * Request attribute set when the response carries a micro frontend the server has to resolve, so
   * a response without one is never walked for them.
   */
  public static final String PENDING = "mateu.microfrontends.pending";

  public static ClientSideComponentDto mapMicroFrontendToDto(MicroFrontend microFrontend) {
    return mapMicroFrontendToDto(microFrontend, null);
  }

  public static ClientSideComponentDto mapMicroFrontendToDto(
      MicroFrontend microFrontend, HttpRequest httpRequest) {
    ServerResolutionDto server = null;
    if (microFrontend.resolvedByServer()) {
      server = new ServerResolutionDto(microFrontend.timeoutMs(), null, null, null, true);
      markPending(httpRequest);
    }
    return new ClientSideComponentDto(
        new MicroFrontendDto(
            microFrontend.baseUrl(),
            microFrontend.route(),
            microFrontend.consumedRoute(),
            microFrontend.style(),
            microFrontend.cssClasses(),
            microFrontend.serverSideType(),
            microFrontend.appState(),
            microFrontend.actionId(),
            null,
            server),
        "fieldId",
        List.of(),
        microFrontend.style(),
        microFrontend.cssClasses(),
        null);
  }

  /**
   * A content slot: a micro frontend the server resolves against the content remote, at the route
   * its key names (both filled in by the resolver, from settings), painting its fallback — or
   * nothing — when there is no content.
   */
  public static ClientSideComponentDto mapContentSlotToDto(
      ContentSlot slot, HttpRequest httpRequest) {
    var id = "slot_" + (slot.key() == null ? "" : slot.key()).replaceAll("[^a-zA-Z0-9]", "_");
    ComponentDto fallback =
        slot.fallback() == null || slot.fallback().isBlank()
            ? null
            : new ClientSideComponentDto(
                new TextDto(TextContainerDto.div, Map.of(), slot.fallback()),
                id,
                List.of(),
                slot.style(),
                slot.cssClasses(),
                null);
    markPending(httpRequest);
    return new ClientSideComponentDto(
        new MicroFrontendDto(
            null,
            null,
            // what the renderers send for a root load: a slot degraded to the client must load too
            "_empty",
            slot.style(),
            slot.cssClasses(),
            null,
            null,
            null,
            null,
            new ServerResolutionDto(
                slot.timeoutMs(),
                null,
                slot.key(),
                fallback,
                Boolean.TRUE.equals(slot.degradeToClient()))),
        id,
        List.of(),
        slot.style(),
        slot.cssClasses(),
        null);
  }

  private static void markPending(HttpRequest httpRequest) {
    if (httpRequest != null) {
      httpRequest.setAttribute(PENDING, Boolean.TRUE);
    }
  }
}
