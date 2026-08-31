package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.application.export.MateuBundleExporter;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Serves the static bundle at RUNTIME (no build step): {@code GET /mateu/v3/bundle} returns the
 * same {@code manifest.json} the {@code mateu:bundle} Maven goal produces, rendered live from this
 * app's bean graph — so it has full fidelity (real services/DB available) and needs no build. Point
 * a static shell's {@code <mateu-ui bundleUrl="…/mateu/v3/bundle">} at it, or curl it to snapshot
 * the bundle. Pass {@code ?params=true} to also bundle {@code :param} routes as templates. The
 * result is computed once per variant and cached (screen structure is stable within a deployment).
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
  public ResponseEntity<String> bundle(
      @RequestParam(name = "params", defaultValue = "false") boolean includeParamRoutes) {
    var out = includeParamRoutes ? cachedWithParams : cached;
    if (out == null) {
      var cl =
          getClass().getClassLoader(); // app classloader (sees META-INF/mateu route index); TCCL is
      // unreliable off the request thread
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
