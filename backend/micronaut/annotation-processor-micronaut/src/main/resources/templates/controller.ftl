package ${pkgName};

import io.mateu.MicronautHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.ClientErrorLog;
import io.mateu.core.infra.MateuController;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.micronaut.context.annotation.Value;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.annotation.Produces;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import jakarta.annotation.Nullable;
import jakarta.inject.Inject;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

// No @CrossOrigin: cross-origin access is the opt-in mateu.cors.allowed-origins allow-list
// (io.mateu.MateuCorsServerFilter), the same in every adapter.
@Controller("${path}/mateu")
public class ${simpleClassName}MateuController implements MateuController {

    private final MateuService service;

    @Value("${r"${mateu.client-log.enabled:true}"}")
    boolean clientLogEnabled;

    // DefaultInstanceFactory is injected (and unused) so the bean — whose constructor initializes
    // the static MateuInstanceFactory facade — exists before the first request needs it.
    @Inject
    public ${simpleClassName}MateuController(MateuService service, DefaultInstanceFactory defaultInstanceFactory) {
        this.service = service;
    }

    private final String uiId = "${className}";

    private final String baseUrl = "${path}";

    @Override
    public String getBaseUrl() {
        return baseUrl;
    }

    @Post("v3/{/ignored:(?!sse/|sse$|client-log$).*}")
    public Mono<UIIncrementDto> runStepSync(
        @PathVariable("ignored") @Nullable String ignored,
        @Body RunActionRqDto rq,
        HttpRequest<?> serverHttpRequest) throws Throwable {
        var httpRequest = new MicronautHttpRequest(serverHttpRequest).storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return service.runAction(uiId, rq, baseUrl, httpRequest).next();
    }

    // Streamed actions (LongTask, Action.sse): one text/event-stream "data:" event per increment.
    @Produces(MediaType.TEXT_EVENT_STREAM)
    @Post("v3/sse/{/ignored:.*}")
    public Flux<UIIncrementDto> runStepSse(
        @PathVariable("ignored") @Nullable String ignored,
        @Body RunActionRqDto rq,
        HttpRequest<?> serverHttpRequest) throws Throwable {
        var httpRequest = new MicronautHttpRequest(serverHttpRequest).storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return service.runAction(uiId, rq, baseUrl, httpRequest);
    }

    // The renderer's error reports (io.mateu.core.infra.ClientErrorLog): one log line per report.
    @Post(value = "v3/client-log", consumes = MediaType.ALL)
    @ExecuteOn(TaskExecutors.BLOCKING)
    public HttpResponse<?> clientLog(@Body @Nullable byte[] body, HttpRequest<?> request) {
        if (!clientLogEnabled) {
            return HttpResponse.status(io.micronaut.http.HttpStatus.NOT_FOUND);
        }
        String user = request.getUserPrincipal().map(java.security.Principal::getName).orElse(null);
        return HttpResponse.status(
                io.micronaut.http.HttpStatus.valueOf(ClientErrorLog.handle(body, user)));
    }

}
