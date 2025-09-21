package io.mateu;

import io.helidon.webserver.http.ServerRequest;
import io.mateu.core.application.MateuService;
import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.reflection.DefaultInstanceFactory;
import io.mateu.dtos.GetUIRqDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;


@Path("/mateu")
@RequestScoped
@Slf4j
public class HelloMateuController {

    private final MateuService service;

    @Inject
    public HelloMateuController(MateuService service) {
        this.service = service;
    }

    private String uiId = "io.mateu.Hello";

    private String baseUrl = "";

    @Path("v3/ui")
    @POST
    public Mono<UIDto> getUI(
        @RequestBody GetUIRqDto rq) throws Exception {
      return service.getUI(uiId, baseUrl, rq,
        new HelidonMPHttpRequest(null).storeGetUIRqDto(rq));
    }

    @Path("v3/{ignored:.*}")
    @POST
    public Flux<UIIncrementDto> runStep(
            @PathParam("ignored") String ignored,
        @RequestBody RunActionRqDto rq) throws Throwable {
      return service.runAction(uiId, rq, baseUrl,
        new HelidonMPHttpRequest(null).storeRunActionRqDto(rq));
    }

}

