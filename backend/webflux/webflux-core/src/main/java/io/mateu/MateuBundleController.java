package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.export.MateuBundleExporter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

/**
 * Serves the static bundle at RUNTIME (no build step): {@code GET /mateu/v3/bundle} returns the
 * same {@code manifest.json} the {@code mateu:bundle} Maven goal produces, rendered live from this
 * app's bean graph — full fidelity (real services/DB), no build. Point a static shell's {@code
 * <mateu-ui bundleUrl="…/mateu/v3/bundle">} at it, or curl it to snapshot the bundle. Cached after
 * first compute. The exporter blocks (it {@code blockFirst()}s each route), so it runs on a
 * bounded-elastic scheduler, off the event loop. WebFlux counterpart of the MVC controller.
 */
@RestController
@CrossOrigin
public class MateuBundleController {

  private final MateuService service;
  private volatile String cached;
  private volatile String cachedWithParams;

  public MateuBundleController(MateuService service) {
    this.service = service;
  }

  @GetMapping(value = "/mateu/v3/bundle", produces = MediaType.APPLICATION_JSON_VALUE)
  public Mono<ResponseEntity<String>> bundle(
      @RequestParam(name = "params", defaultValue = "false") boolean includeParamRoutes) {
    return Mono.fromCallable(() -> render(includeParamRoutes))
        .subscribeOn(Schedulers.boundedElastic());
  }

  private ResponseEntity<String> render(boolean includeParamRoutes) {
    var out = includeParamRoutes ? cachedWithParams : cached;
    if (out == null) {
      var cl =
          getClass().getClassLoader(); // app classloader (sees META-INF/mateu route index); TCCL is
      // unreliable on the bounded-elastic worker thread
      var manifest = new MateuBundleExporter(service).exportAll("", cl, true, includeParamRoutes);
      try {
        out = MateuBundleExporter.defaultWireMapper().writeValueAsString(manifest);
      } catch (Exception e) {
        return ResponseEntity.internalServerError().body("{\"error\":\"" + e.getMessage() + "\"}");
      }
      if (includeParamRoutes) {
        cachedWithParams = out;
      } else {
        cached = out;
      }
    }
    return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(out);
  }
}
