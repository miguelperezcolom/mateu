package ${pkgName};

import io.mateu.QuarkusHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.vertx.core.http.HttpServerRequest;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;

@Path("${path}/mateu")
@Slf4j
public class ${simpleClassName}MateuController {

    private final MateuService service;

    @Inject
    public ${simpleClassName}MateuController(MateuService service) {
        this.service = service;
    }

    private String uiId = "${className}";

    private String baseUrl = "${path}";

    @Post(value = "v3/ui")
    public Mono<UIDto> getUI(
        @Body GetUIRqDto rq,
        HttpRequest serverHttpRequest) throws Exception {
      return service.getUI(uiId, baseUrl, rq,
        new QuarkusHttpRequest(serverHttpRequest));
    }

    @Post("v3/{route}/{actionId}")
    public Mono<UIIncrementDto> runStep(
        @PathVariable("route") String route,
        @PathVariable("actionId") String actionId,
        @Body RunActionRqDto rq,
        HttpRequest serverHttpRequest) throws Throwable {
      return service.runAction(uiId, "/" + route, actionId, rq, baseUrl,
        new QuarkusHttpRequest(serverHttpRequest));
    }

}

