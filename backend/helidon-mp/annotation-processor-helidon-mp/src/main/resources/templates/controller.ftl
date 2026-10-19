package ${pkgName};

import io.mateu.HelidonMPHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.WireMapper;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.StreamingOutput;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;
import java.nio.charset.StandardCharsets;

// Cross-origin access is the opt-in mateu.cors.allowed-origins allow-list (io.mateu.MateuHelidonRoutes),
// the same in every adapter.
@Path("${path}/mateu")
@RequestScoped
public class ${simpleClassName}MateuController implements MateuController {

    private final MateuService service;

    @Inject
    public ${simpleClassName}MateuController(MateuService service) {
        this.service = service;
    }

    // Read by io.mateu.MateuHelidonRoutes, which serves this UI's streamed actions (v3/sse/**) on
    // the Helidon routing itself: through Jersey the events were buffered until the end.
    public static final String MATEU_UI_ID = "${className}";
    public static final String MATEU_BASE_URL = "${path}";

    private final String uiId = MATEU_UI_ID;

    private final String baseUrl = MATEU_BASE_URL;

    @Override
    public String getBaseUrl() {
        return baseUrl;
    }

    // The Mateu mobile app's manifest (io.mateu.core.infra.MobileManifest): public, cacheable JSON
    // with the name, icon and identity provider the app shows for this UI.
    @Path("v3/manifest")
    @jakarta.ws.rs.GET
    public jakarta.ws.rs.core.Response mobileManifest() {
        var response = jakarta.ws.rs.core.Response.ok(io.mateu.core.infra.MobileManifest.json(uiId));
        io.mateu.core.infra.MobileManifest.HEADERS.forEach((name, value) -> response.header(name, value));
        return response.build();
    }

    @Path("v3/{ignored:.*}")
    @POST
    public UIIncrementDto runStep(
            @PathParam("ignored") String ignored,
            RunActionRqDto rq,
            @Context HttpHeaders headers,
            @Context UriInfo uriInfo,
            @Context SecurityContext securityContext,
            @Context io.helidon.webserver.http.ServerRequest serverRequest)
            throws Throwable {
        var httpRequest =
                new HelidonMPHttpRequest(headers, uriInfo)
                        .withPrincipal(securityContext != null ? securityContext.getUserPrincipal() : null)
                        .withRemoteOf(serverRequest)
                        .storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return service.runAction(uiId, rq, baseUrl, httpRequest).blockFirst();
    }

    // Streamed actions (LongTask, Action.sse): one text/event-stream "data:" event per increment.
    // Normally answered by io.mateu.MateuHelidonRoutes on the Helidon routing, ahead of Jersey (which
    // buffers a StreamingOutput); this is the fallback when that routing is not in place.
    @Path("v3/sse/{ignored:.*}")
    @POST
    @Produces("text/event-stream")
    public StreamingOutput runSseStep(
            @PathParam("ignored") String ignored,
            RunActionRqDto rq,
            @Context HttpHeaders headers,
            @Context UriInfo uriInfo,
            @Context SecurityContext securityContext,
            @Context io.helidon.webserver.http.ServerRequest serverRequest)
            throws Throwable {
        var httpRequest =
                new HelidonMPHttpRequest(headers, uriInfo)
                        .withPrincipal(securityContext != null ? securityContext.getUserPrincipal() : null)
                        .withRemoteOf(serverRequest)
                        .storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        var increments = service.runAction(uiId, rq, baseUrl, httpRequest);
        return output -> {
            for (UIIncrementDto increment : increments.toIterable()) {
                output.write(WireMapper.sseEvent(increment).getBytes(StandardCharsets.UTF_8));
                output.flush();
            }
        };
    }
}
