package io.mateu;

import io.mateu.core.infra.uploads.UploadEndpoint;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * {@code POST /mateu/v3/upload} and {@code /mateu/v3/upload/target} on WebFlux: the HTTP shell of
 * {@link UploadEndpoint}. The body is handed over as a blocking {@link java.io.InputStream} that
 * requests buffers on demand (backpressure: never the whole file in memory), read on a
 * bounded-elastic thread, off the event loop.
 */
@RestController
public class MateuUploadController {

  private static final int DEMAND = 16;

  /** A target request is a few names and numbers. */
  private static final int MAX_TARGET_REQUEST_BYTES = 64 * 1024;

  private final UploadEndpoint endpoint = new UploadEndpoint();

  @PostMapping(value = UploadEndpoint.PATH, produces = MediaType.APPLICATION_JSON_VALUE)
  public Mono<ResponseEntity<String>> upload(ServerWebExchange exchange) {
    var request = exchange.getRequest();
    var headers = request.getHeaders();
    var httpRequest = new SpringHttpRequest(request);
    return exchange
        .getPrincipal()
        .map(java.util.Optional::<java.security.Principal>of)
        .defaultIfEmpty(java.util.Optional.empty())
        .flatMap(
            principal ->
                Mono.fromCallable(
                        () -> {
                          principal.ifPresent(httpRequest::withPrincipal);
                          try (var body =
                              DataBufferUtils.subscriberInputStream(request.getBody(), DEMAND)) {
                            return json(
                                endpoint.upload(
                                    headers.getFirst(UploadEndpoint.TICKET_HEADER),
                                    headers.getFirst(UploadEndpoint.NAME_HEADER),
                                    headers.getFirst(HttpHeaders.CONTENT_TYPE),
                                    headers.getContentLength(),
                                    body,
                                    httpRequest));
                          }
                        })
                    .subscribeOn(Schedulers.boundedElastic()));
  }

  @PostMapping(value = UploadEndpoint.TARGET_PATH, produces = MediaType.APPLICATION_JSON_VALUE)
  public Mono<ResponseEntity<String>> target(ServerWebExchange exchange) {
    var request = exchange.getRequest();
    var httpRequest = new SpringHttpRequest(request);
    return exchange
        .getPrincipal()
        .map(java.util.Optional::<java.security.Principal>of)
        .defaultIfEmpty(java.util.Optional.empty())
        .zipWith(
            DataBufferUtils.join(request.getBody(), MAX_TARGET_REQUEST_BYTES)
                .map(
                    buffer -> {
                      try {
                        return buffer.toString(java.nio.charset.StandardCharsets.UTF_8);
                      } finally {
                        DataBufferUtils.release(buffer);
                      }
                    })
                .defaultIfEmpty(""))
        .publishOn(Schedulers.boundedElastic())
        .map(
            principalAndBody -> {
              principalAndBody.getT1().ifPresent(httpRequest::withPrincipal);
              return json(
                  endpoint.target(
                      request.getHeaders().getFirst(UploadEndpoint.TICKET_HEADER),
                      principalAndBody.getT2(),
                      httpRequest));
            });
  }

  private static ResponseEntity<String> json(UploadEndpoint.Answer answer) {
    return ResponseEntity.status(answer.status())
        .contentType(MediaType.APPLICATION_JSON)
        .body(answer.body());
  }
}
