package io.mateu;

import io.mateu.core.infra.uploads.UploadEndpoint;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpHeaders;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Post;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;
import java.io.InputStream;

/**
 * {@code POST /mateu/v3/upload} and {@code /mateu/v3/upload/target} on Micronaut: the HTTP shell of
 * {@link UploadEndpoint}, on the blocking pool (the body is read as a blocking stream, off the
 * Netty event loop). Netty refuses bodies over {@code micronaut.server.max-request-size} (10 MB by
 * default) before Mateu sees them: raise it to the largest file the app accepts.
 */
@Controller
public class MateuUploadController {

  private final UploadEndpoint endpoint = new UploadEndpoint();

  @Post(
      value = UploadEndpoint.PATH,
      consumes = MediaType.ALL,
      produces = MediaType.APPLICATION_JSON)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> upload(@Body InputStream body, HttpRequest<?> request) {
    var headers = request.getHeaders();
    return json(
        endpoint.upload(
            headers.get(UploadEndpoint.TICKET_HEADER),
            headers.get(UploadEndpoint.NAME_HEADER),
            headers.get(HttpHeaders.CONTENT_TYPE),
            headers.contentLength().orElse(-1L),
            body,
            new MicronautHttpRequest(request)));
  }

  @Post(
      value = UploadEndpoint.TARGET_PATH,
      consumes = MediaType.ALL,
      produces = MediaType.APPLICATION_JSON)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> target(@Body @Nullable String body, HttpRequest<?> request) {
    return json(
        endpoint.target(
            request.getHeaders().get(UploadEndpoint.TICKET_HEADER),
            body,
            new MicronautHttpRequest(request)));
  }

  private static HttpResponse<String> json(UploadEndpoint.Answer answer) {
    return HttpResponse.<String>status(HttpStatus.valueOf(answer.status()))
        .body(answer.body())
        .contentType(MediaType.APPLICATION_JSON);
  }
}
