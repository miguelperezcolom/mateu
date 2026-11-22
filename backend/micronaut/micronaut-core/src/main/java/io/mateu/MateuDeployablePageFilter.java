package io.mateu;

import io.mateu.core.infra.DeployablePage;
import io.mateu.core.infra.MateuController;
import io.mateu.uidl.di.MateuBeanProvider;
import io.micronaut.core.annotation.Nullable;
import io.micronaut.http.HttpMethod;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.RequestFilter;
import io.micronaut.http.annotation.ServerFilter;
import java.util.ArrayList;
import java.util.List;

/**
 * Keeps the renderer jar's deployable page ({@code static/index.html}, made for a CDN — see {@link
 * DeployablePage}) from being served by this app: with {@code static/} mapped at {@code /**} (the
 * Micronaut starter's {@code micronaut.router.static-resources}) Micronaut would answer it at
 * {@code /index.html}, and at {@code /} when no Mateu UI sits at the root. Those requests answer
 * 404, as before the renderer jars shipped the page; a root UI keeps {@code /}.
 */
@ServerFilter({"/", "/index.html"})
public class MateuDeployablePageFilter {

  @RequestFilter
  @Nullable
  public HttpResponse<?> hide(HttpRequest<?> request) {
    HttpMethod method = request.getMethod();
    if (method != HttpMethod.GET && method != HttpMethod.HEAD) {
      return null;
    }
    return DeployablePage.hidden(
            request.getPath(), baseUrls(), Thread.currentThread().getContextClassLoader())
        ? HttpResponse.notFound()
        : null;
  }

  private static List<String> baseUrls() {
    var baseUrls = new ArrayList<String>();
    if (!MateuBeanProvider.isInitialized()) {
      return baseUrls;
    }
    for (MateuController controller : MateuBeanProvider.getBeans(MateuController.class)) {
      baseUrls.add(controller.getBaseUrl());
    }
    return baseUrls;
  }
}
