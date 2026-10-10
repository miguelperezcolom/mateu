package ${pkgName};

import io.mateu.QuarkusHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.MateuController;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.smallrye.common.annotation.Blocking;
import io.smallrye.mutiny.Multi;
import io.vertx.core.http.HttpServerRequest;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.jboss.resteasy.reactive.RestStreamElementType;
import reactor.adapter.JdkFlowAdapter;

// Cross-origin access is the opt-in mateu.cors.allowed-origins allow-list (io.mateu.MateuQuarkusRoutes),
// the same in every adapter.
@Path("${path}/mateu")
public class ${simpleClassName}MateuController implements MateuController {

    private final MateuService service;

    @Inject
    public ${simpleClassName}MateuController(MateuService service) {
        this.service = service;
    }

    private final String uiId = "${className}";

    private final String baseUrl = "${path}";

    @Override
    public String getBaseUrl() {
        return baseUrl;
    }

    @Path("v3/{ignored:.*}")
    @POST
    public UIIncrementDto runStep(
        String ignored,
        RunActionRqDto rq,
        HttpServerRequest serverHttpRequest) throws Throwable {
        var httpRequest = new QuarkusHttpRequest(serverHttpRequest).storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return service.runAction(uiId, rq, baseUrl, httpRequest).blockFirst();
    }

    // Streamed actions (LongTask, Action.sse): one text/event-stream "data:" event per increment,
    // sent as soon as it is produced. It used to fall into runStep above and answer ONE plain JSON
    // body, so a LongTask's progress never reached the browser.
    @Path("v3/sse/{ignored:.*}")
    @POST
    @Produces(MediaType.SERVER_SENT_EVENTS)
    @RestStreamElementType(MediaType.APPLICATION_JSON)
    @Blocking
    public Multi<UIIncrementDto> runSseStep(
        String ignored,
        RunActionRqDto rq,
        HttpServerRequest serverHttpRequest) throws Throwable {
        var httpRequest = new QuarkusHttpRequest(serverHttpRequest).storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return Multi.createFrom().publisher(JdkFlowAdapter.publisherToFlowPublisher(
                service.runAction(uiId, rq, baseUrl, httpRequest)));
    }

}
