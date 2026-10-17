package io.mateu;

import io.mateu.core.application.MateuService;
import io.mateu.core.infra.BundleEndpoint;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** {@code GET /mateu/v3/bundle} on Spring MVC: the HTTP shell of {@link BundleEndpoint}. */
@RestController
@CrossOrigin
public class MateuBundleController {

  private final BundleEndpoint endpoint;

  public MateuBundleController(MateuService service) {
    // the app classloader (sees the META-INF/mateu route index); the TCCL is unreliable off the
    // request thread
    this.endpoint = new BundleEndpoint(service, getClass().getClassLoader());
  }

  @GetMapping(value = BundleEndpoint.PATH, produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<String> bundle(
      @RequestParam(name = BundleEndpoint.PARAMS_QUERY, defaultValue = "false")
          boolean includeParamRoutes) {
    var answer = endpoint.render(includeParamRoutes);
    return ResponseEntity.status(answer.status())
        .contentType(MediaType.APPLICATION_JSON)
        .body(answer.body());
  }
}
