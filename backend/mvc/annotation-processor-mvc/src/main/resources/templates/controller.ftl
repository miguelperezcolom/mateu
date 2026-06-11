package ${pkgName};

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import io.mateu.core.infra.MateuController;


@CrossOrigin
@RestController("${pkgName}.${simpleClassName}MateuController")
@RequestMapping("${path}/mateu")
@Slf4j
public class ${simpleClassName}MateuController implements MateuController {

    private final MateuService service;

    public ${simpleClassName}MateuController(MateuService service) {
        this.service = service;
    }

    private String uiId = "${className}";

    private String baseUrl = "${path}";

    public String getBaseUrl() {
        return baseUrl;
    }

    @PostMapping("v3/sse/**")
    public SseEmitter runSseAction(
        @RequestBody RunActionRqDto rq,
        HttpServletRequest serverHttpRequest) throws Throwable {
    var httpRequest = new SpringHttpRequest(serverHttpRequest).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", uiId);
    httpRequest.setAttribute("baseUrl", baseUrl);
    SseEmitter emitter = new SseEmitter(0L);
    service.runAction(uiId, rq, baseUrl, httpRequest).subscribe(
        increment -> {
            try {
                emitter.send(SseEmitter.event().data(increment, MediaType.APPLICATION_JSON));
            } catch (IOException e) {
                emitter.completeWithError(e);
            }
        },
        emitter::completeWithError,
        emitter::complete
    );
    return emitter;
    }

    @PostMapping("v3/**")
    public Mono<UIIncrementDto> runStep(
        @RequestBody RunActionRqDto rq,
        HttpServletRequest serverHttpRequest) throws Throwable {
    var httpRequest = new SpringHttpRequest(serverHttpRequest).storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", uiId);
    httpRequest.setAttribute("baseUrl", baseUrl);
    return service.runAction(uiId, rq, baseUrl, httpRequest).next();
    }

}
