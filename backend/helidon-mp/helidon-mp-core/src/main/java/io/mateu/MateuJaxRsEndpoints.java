package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.mcp.McpEndpoint;
import io.mateu.core.infra.WireMapper;
import io.mateu.core.infra.YamlMounts;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriInfo;
import jakarta.ws.rs.sse.Sse;
import jakarta.ws.rs.sse.SseEventSink;

/**
 * The MCP endpoint and the YAML mounts' API served through Jersey, for the calls only JAX-RS can
 * authenticate ({@link MateuHelidonRoutes#onlyJaxRsAuthenticates}): an app that authenticates with
 * MicroProfile JWT or a {@code ContainerRequestFilter} and not with helidon-security. Those routes
 * are normally answered on the Helidon routing, ahead of Jersey, where such an identity does not
 * exist yet — the caller was anonymous there, so {@code @EyesOnly} and YAML {@code access:} refused
 * it. The Helidon routing hands such a call on; this is where it lands, with the JAX-RS {@code
 * SecurityContext}'s principal.
 *
 * <p>The paths never shadow a generated controller (a {@code <baseUrl>/mateu} resource is more
 * specific) and answer 404 for anything that is not an enabled MCP endpoint or a YAML mount.
 */
@Path("/")
@RequestScoped
public class MateuJaxRsEndpoints {

  @Inject MateuService service;
  @Inject MateuHelidonRoutes routes;

  @POST
  @Path("mateu/mcp")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public Response mcp(
      String body,
      @Context HttpHeaders headers,
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Context io.helidon.webserver.http.ServerRequest serverRequest)
      throws Exception {
    if (!routes.mcpEnabled()) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    var principal = principalOf(securityContext);
    if (routes.authenticationRequired() && principal == null) {
      return Response.status(Response.Status.UNAUTHORIZED).build();
    }
    String answer =
        new McpEndpoint(service)
            .handle(
                body,
                rq ->
                    new HelidonMPHttpRequest(headers, uriInfo)
                        .withPrincipal(principal)
                        .withRemoteOf(serverRequest)
                        .storeRunActionRqDto(rq));
    return answer == null
        ? Response.status(McpEndpoint.ACCEPTED).build()
        : Response.ok(answer, MediaType.APPLICATION_JSON_TYPE).build();
  }

  @POST
  @Path("{path: .*mateu/v3/sync/.*}")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.APPLICATION_JSON)
  public Response yamlSync(
      @PathParam("path") String path,
      String body,
      @Context HttpHeaders headers,
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Context io.helidon.webserver.http.ServerRequest serverRequest)
      throws Throwable {
    var mount = YamlMounts.mountForApiPath(routes.yamlMounts(), "/" + path);
    if (mount == null) {
      return Response.status(Response.Status.NOT_FOUND).build();
    }
    var principal = principalOf(securityContext);
    if (routes.authenticationRequired() && principal == null) {
      return Response.status(Response.Status.UNAUTHORIZED).build();
    }
    var rq = WireMapper.shared().readValue(body, RunActionRqDto.class);
    UIIncrementDto increment =
        service
            .runAction(
                mount.basePath(),
                YamlMounts.mountRequest(mount.basePath(), rq),
                mount.basePath(),
                requestOf(headers, uriInfo, principal, serverRequest, rq, mount))
            .blockFirst();
    return Response.ok(
            WireMapper.shared().writeValueAsString(increment), MediaType.APPLICATION_JSON)
        .build();
  }

  @POST
  @Path("{path: .*mateu/v3/sse/.*}")
  @Consumes(MediaType.WILDCARD)
  @Produces(MediaType.SERVER_SENT_EVENTS)
  public void yamlSse(
      @PathParam("path") String path,
      String body,
      @Context HttpHeaders headers,
      @Context UriInfo uriInfo,
      @Context SecurityContext securityContext,
      @Context io.helidon.webserver.http.ServerRequest serverRequest,
      @Context SseEventSink sink,
      @Context Sse sse)
      throws Throwable {
    var mount = YamlMounts.mountForApiPath(routes.yamlMounts(), "/" + path);
    if (mount == null) {
      throw new jakarta.ws.rs.NotFoundException();
    }
    var principal = principalOf(securityContext);
    if (routes.authenticationRequired() && principal == null) {
      throw new jakarta.ws.rs.NotAuthorizedException("Mateu");
    }
    var rq = WireMapper.shared().readValue(body, RunActionRqDto.class);
    var httpRequest = requestOf(headers, uriInfo, principal, serverRequest, rq, mount);
    JerseySse.stream(
        service.runAction(
            mount.basePath(),
            YamlMounts.mountRequest(mount.basePath(), rq),
            mount.basePath(),
            httpRequest),
        sink,
        sse);
  }

  private static java.security.Principal principalOf(SecurityContext securityContext) {
    return securityContext == null ? null : securityContext.getUserPrincipal();
  }

  private static io.mateu.uidl.interfaces.HttpRequest requestOf(
      HttpHeaders headers,
      UriInfo uriInfo,
      java.security.Principal principal,
      io.helidon.webserver.http.ServerRequest serverRequest,
      RunActionRqDto rq,
      YamlMounts.Mount mount) {
    var httpRequest =
        new HelidonMPHttpRequest(headers, uriInfo)
            .withPrincipal(principal)
            .withRemoteOf(serverRequest)
            .storeRunActionRqDto(rq);
    httpRequest.setAttribute("uiId", "");
    httpRequest.setAttribute("baseUrl", mount.basePath());
    return httpRequest;
  }
}
