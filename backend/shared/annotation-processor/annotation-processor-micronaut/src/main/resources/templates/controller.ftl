package ${pkgName};

import io.mateu.MicronautHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.JourneyCreationRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.server.cors.CrossOrigin;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import reactor.core.publisher.Mono;


@CrossOrigin
@Controller("${path}/mateu")
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
        new MicronautHttpRequest(serverHttpRequest));
    }

    @Post("v3/journeys/{journeyTypeId}/{journeyId}")
    public Mono<UIIncrementDto> createJourney(
        @PathVariable("journeyTypeId") String journeyTypeId,
        @PathVariable("journeyId") String journeyId,
        @Body JourneyCreationRqDto rq,
        HttpRequest serverHttpRequest) throws Throwable {
      return service.createJourney(uiId, baseUrl, journeyTypeId, journeyId, rq,
        new MicronautHttpRequest(serverHttpRequest));
    }

    @Post("v3/components/{componentId}/{actionId}")
    public Mono<UIIncrementDto> runStep(
        @PathVariable("componentId") String componentId,
        @PathVariable("actionId") String actionId,
        @Body RunActionRqDto rq,
        HttpRequest serverHttpRequest) throws Throwable {
      return service.runAction(componentId, actionId, rq, baseUrl,
        new MicronautHttpRequest(serverHttpRequest));
    }

}
