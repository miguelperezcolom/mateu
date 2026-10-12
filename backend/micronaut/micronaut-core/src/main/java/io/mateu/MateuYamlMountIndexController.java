package io.mateu;

import io.mateu.core.infra.YamlMounts;
import io.micronaut.context.annotation.Requires;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.PathVariable;
import io.micronaut.scheduling.TaskExecutors;
import io.micronaut.scheduling.annotation.ExecuteOn;

/**
 * The SPA shell of every YAML mount ({@link MateuYamlMountController#mounts()}) and its deep links,
 * for a deployment with no ROOT Java {@code @UI}: with one, its generated catch-all index answers
 * every path — the YAML mounts' deep links included ({@link YamlMounts#deepLinkIndex}) — and this
 * controller's catch-all would be equally specific ({@link MateuYamlMountController.NoRootUi}). The
 * mounts' API is {@link MateuYamlMountController}, present either way.
 */
@Controller
@Requires(condition = MateuYamlMountController.NoRootUi.class)
public class MateuYamlMountIndexController {

  private final MateuYamlMountController api;

  public MateuYamlMountIndexController(MateuYamlMountController api) {
    this.api = api;
  }

  @Get(
      uris = {"/", "/{+path:(?!.*mateu/v3/manifest$)[^.]*}"},
      produces = MediaType.TEXT_HTML)
  @ExecuteOn(TaskExecutors.BLOCKING)
  public HttpResponse<String> index(@PathVariable("path") @Nullable String path) {
    String requested = "/" + (path == null ? "" : path);
    YamlMounts.Mount best = null;
    for (var mount : api.mounts()) {
      var spa = mount.spaPath();
      boolean owns =
          "/".equals(spa)
              || requested.equals(spa)
              || (requested.startsWith(spa + "/") && !requested.contains("/mateu/"));
      if (owns && (best == null || spa.length() > best.spaPath().length())) {
        best = mount;
      }
    }
    if (best == null || requested.contains("/mateu/")) {
      return HttpResponse.status(HttpStatus.NOT_FOUND);
    }
    return HttpResponse.ok(best.indexHtml()).contentType(MediaType.TEXT_HTML_TYPE);
  }
}
