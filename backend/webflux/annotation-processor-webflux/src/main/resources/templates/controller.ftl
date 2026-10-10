package ${pkgName};

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.infra.MateuController;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

// No @CrossOrigin: cross-origin access is the opt-in mateu.cors.allowed-origins allow-list
// (io.mateu.MateuCorsWebFilter), the same in every adapter.
@RestController("${pkgName}.${simpleClassName}MateuController")
@RequestMapping("${path}/mateu")
public class ${simpleClassName}MateuController implements MateuController {

    private final MateuService service;

    public ${simpleClassName}MateuController(MateuService service) {
        this.service = service;
    }

    private final String uiId = "${className}";

    private final String baseUrl = "${path}";

    public String getBaseUrl() {
        return baseUrl;
    }

    // Streamed actions (LongTask, Action.sse): one text/event-stream "data:" event per increment,
    // sent as soon as it is produced.
    @PostMapping("v3/sse/**")
    public Flux<ServerSentEvent<UIIncrementDto>> runSseAction(
            @RequestBody RunActionRqDto rq,
            ServerWebExchange exchange) throws Throwable {
        var springRequest = new SpringHttpRequest(exchange.getRequest());
        var httpRequest = springRequest.storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        // the authenticated principal (Spring Security) is resolved reactively before running
        return SpringHttpRequest.withPrincipalOf(exchange, springRequest,
                        () -> service.runAction(uiId, rq, baseUrl, httpRequest))
                .map(increment -> ServerSentEvent.builder(increment).build());
    }

    // Every other v3 call. The first segment EXCLUDES "sse", so no URL matches two handler methods.
    @PostMapping("v3/{operation:(?!sse$).+}/**")
    public Mono<UIIncrementDto> runStep(
            @RequestBody RunActionRqDto rq,
            ServerWebExchange exchange) throws Throwable {
        var springRequest = new SpringHttpRequest(exchange.getRequest());
        var httpRequest = springRequest.storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return SpringHttpRequest.withPrincipalOf(exchange, springRequest,
                        () -> service.runAction(uiId, rq, baseUrl, httpRequest))
                .next();
    }

}
