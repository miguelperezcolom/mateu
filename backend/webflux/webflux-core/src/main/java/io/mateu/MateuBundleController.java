package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.infra.BundleEndpoint;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * {@code GET /mateu/v3/bundle} on WebFlux: the HTTP shell of {@link BundleEndpoint}. The exporter
 * blocks (it {@code blockFirst()}s each route), so it runs on a bounded-elastic scheduler, off the
 * event loop.
 */
@RestController
@CrossOrigin
public class MateuBundleController {

  private final BundleEndpoint endpoint;

  public MateuBundleController(MateuService service) {
    // the app classloader (sees the META-INF/mateu route index); the TCCL is unreliable on the
    // bounded-elastic worker thread
    this.endpoint = new BundleEndpoint(service, getClass().getClassLoader());
  }

  @GetMapping(value = BundleEndpoint.PATH, produces = MediaType.APPLICATION_JSON_VALUE)
  public Mono<ResponseEntity<String>> bundle(
      @RequestParam(name = BundleEndpoint.PARAMS_QUERY, defaultValue = "false")
          boolean includeParamRoutes) {
    return Mono.fromCallable(
            () -> {
              var answer = endpoint.render(includeParamRoutes);
              return ResponseEntity.status(answer.status())
                  .contentType(MediaType.APPLICATION_JSON)
                  .body(answer.body());
            })
        .subscribeOn(Schedulers.boundedElastic());
  }
}
