package ${pkgName};

import io.mateu.MicronautHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.core.infra.reflection.DefaultInstanceFactory;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.http.annotation.Post;
import io.micronaut.http.server.cors.CrossOrigin;
import jakarta.annotation.Nullable;
import jakarta.inject.Inject;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Flux;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Produces;


@CrossOrigin
@Controller("${path}/mateu")
@Slf4j
public class ${simpleClassName}MateuController {

    private final MateuService service;
    private final DefaultInstanceFactory defaultInstanceFactory;

    @Inject
    public ${simpleClassName}MateuController(MateuService service, DefaultInstanceFactory defaultInstanceFactory) {
        this.service = service;
        this.defaultInstanceFactory = defaultInstanceFactory;
    }

    private String uiId = "${className}";

    private String baseUrl = "${path}";

    @Post(value = "v3/ui")
    public Mono<UIDto> getUI(
        @Body GetUIRqDto rq,
        HttpRequest serverHttpRequest) throws Exception {
      return service.getUI(uiId, baseUrl, rq,
        new MicronautHttpRequest(serverHttpRequest).storeGetUIRqDto(rq));
    }

    @Post("v3/sync/{/ignored:.*}")
    public Mono<UIIncrementDto> runStepSync(
        @PathVariable("ignored") @Nullable String ignored,
        @Body RunActionRqDto rq,
        HttpRequest serverHttpRequest) throws Throwable {
        return service.runAction(uiId, rq, baseUrl,
        new MicronautHttpRequest(serverHttpRequest).storeRunActionRqDto(rq)).next();
    }

    @Produces(MediaType.TEXT_EVENT_STREAM)
    @Post("v3/sse/{/ignored:.*}")
    public Flux<UIIncrementDto> runStepSse(
        @PathVariable("ignored") @Nullable String ignored,
        @Body RunActionRqDto rq,
        HttpRequest serverHttpRequest) throws Throwable {
      return service.runAction(uiId, rq, baseUrl,
        new MicronautHttpRequest(serverHttpRequest).storeRunActionRqDto(rq));
    }

}
