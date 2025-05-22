package ${pkgName};

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;


@CrossOrigin
@RestController("${pkgName}.${simpleClassName}MateuController")
@RequestMapping("${path}/mateu")
@Slf4j
@RequiredArgsConstructor
public class ${simpleClassName}MateuController {

    private final MateuService service;

    private String uiId = "${className}";

    private String baseUrl = "${path}";

    @PostMapping(value = "v3/ui")
    public Mono<UIDto> getUI(
            @RequestBody GetUIRqDto rq,
            HttpServletRequest serverHttpRequest) throws Exception {
      return service.getUI(uiId, baseUrl, rq,
        new SpringHttpRequest(serverHttpRequest));
    }

    @PostMapping("v3/{route}/{actionId}")
    public Mono<UIIncrementDto> runStep(
        @PathVariable("route") String route,
        @PathVariable("actionId") String actionId,
        @RequestBody RunActionRqDto rq,
        HttpServletRequest serverHttpRequest) throws Throwable {
      return service.runAction(uiId, "/" + route, actionId, rq, baseUrl,
        new SpringHttpRequest(serverHttpRequest));
    }

}
