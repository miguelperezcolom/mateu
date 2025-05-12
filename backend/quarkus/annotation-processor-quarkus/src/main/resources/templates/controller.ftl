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


    @Path("v3/ui")
    @POST
    public UIDto getUI(
        GetUIRqDto rq,
        HttpServerRequest serverHttpRequest) throws Exception {
      return service.getUI(uiId, baseUrl, rq,
        new QuarkusHttpRequest(serverHttpRequest)).block();
    }

    @Path("v3/journeys/{journeyTypeId}/{journeyId}")
    @POST
    public UIIncrementDto createJourney(
        String journeyTypeId,
        String journeyId,
        JourneyCreationRqDto rq,
        HttpServerRequest serverHttpRequest) throws Throwable {
      return service.createJourney(uiId, baseUrl, journeyTypeId, journeyId, rq,
        new QuarkusHttpRequest(serverHttpRequest)).block();
    }

    @Path("v3/components/{componentId}/{actionId}")
    @POST
    public UIIncrementDto runStep(
        String componentId,
        String actionId,
        RunActionRqDto rq,
        HttpServerRequest serverHttpRequest) throws Throwable {
      return service.runAction(componentId, actionId, rq, baseUrl,
        new QuarkusHttpRequest(serverHttpRequest)).block();
    }

}

