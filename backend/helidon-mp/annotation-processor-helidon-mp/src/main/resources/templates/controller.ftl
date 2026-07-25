
package ${pkgName};

import io.mateu.HelidonMPHttpRequest;
import io.mateu.core.application.MateuService;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.UriInfo;
import lombok.extern.slf4j.Slf4j;

@Path("${path}/mateu")
@RequestScoped
@Slf4j
public class ${simpleClassName}MateuController {

    private final MateuService service;

    @Inject
    public ${simpleClassName}MateuController(MateuService service) {
        this.service = service;
    }

    private final String uiId = "${className}";

    private final String baseUrl = "${path}";

    @Path("v3/{ignored:.*}")
    @POST
    public UIIncrementDto runStep(
            @PathParam("ignored") String ignored,
            RunActionRqDto rq,
            @Context HttpHeaders headers,
            @Context UriInfo uriInfo)
            throws Throwable {
        var httpRequest =
                new HelidonMPHttpRequest(headers, uriInfo).storeRunActionRqDto(rq);
        httpRequest.setAttribute("uiId", uiId);
        httpRequest.setAttribute("baseUrl", baseUrl);
        return service.runAction(uiId, rq, baseUrl, httpRequest).blockFirst();
    }
}
