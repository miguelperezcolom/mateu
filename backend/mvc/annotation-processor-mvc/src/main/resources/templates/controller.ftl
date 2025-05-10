package ${pkgName};

import io.mateu.core.application.MateuService;
import io.mateu.dtos.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.codec.multipart.FilePart;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import jakarta.servlet.http.HttpServletRequest;
import io.mateu.SpringHttpRequest;

import javax.naming.AuthenticationException;
import java.util.Map;


@CrossOrigin
@RestController("${pkgName}.${simpleClassName}MateuController")
@RequestMapping("${path}/mateu")
@Slf4j
public class ${simpleClassName}MateuController {

    @Autowired
    private MateuService service;

    private String uiId = "${className}";

    private String baseUrl = "${path}";


    @PostMapping(value = "v3/ui")
    public Mono<UIDto> getUI(
            @RequestBody GetUIRqDto rq,
            HttpServletRequest serverHttpRequest) throws Exception {
        return service.getUI(uiId, baseUrl, rq, new SpringHttpRequest(serverHttpRequest));
    }

    @PostMapping("v3/journeys/{journeyTypeId}/{journeyId}")
    public Mono<UIIncrementDto> createJourney(
            @PathVariable("journeyTypeId") String journeyTypeId,
            @PathVariable("journeyId") String journeyId,
            @RequestBody JourneyCreationRqDto rq,
            HttpServletRequest serverHttpRequest) throws Throwable {
        return service.createJourney(uiId, baseUrl, journeyTypeId, journeyId, rq,
                new SpringHttpRequest(serverHttpRequest));
    }

    @PostMapping("v3/components/{componentId}/{actionId}")
    public Mono<UIIncrementDto> runStep(
            @PathVariable("componentId") String componentId,
            @PathVariable("actionId") String actionId,
            @RequestBody RunActionRqDto rq,
            HttpServletRequest serverHttpRequest) throws Throwable {
        return service.runAction(componentId, actionId, rq, baseUrl, new SpringHttpRequest(serverHttpRequest));
    }

}
