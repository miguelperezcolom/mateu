package ${pkgName};

import io.mateu.SpringHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
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

    @PostMapping("v3/{ignored}")
    public Mono<UIIncrementDto> runStep(
        @PathVariable("ignored") String ignored,
        @RequestBody RunActionRqDto rq,
        ServerHttpRequest serverHttpRequest) throws Throwable {
      return service.runAction(uiId, rq, baseUrl,
        new SpringHttpRequest(serverHttpRequest).storeRunActionRqDto(rq));
    }

}
