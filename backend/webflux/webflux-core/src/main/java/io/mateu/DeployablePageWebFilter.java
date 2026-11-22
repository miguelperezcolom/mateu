package io.mateu;

import io.mateu.core.infra.DeployablePage;
import io.mateu.core.infra.MateuController;
import io.mateu.uidl.di.MateuBeanProvider;
import java.util.ArrayList;
import java.util.List;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * The WebFlux twin of {@code DeployablePageFilter}: the renderer jar's deployable page ({@code
 * static/index.html}, made for a CDN — see {@link DeployablePage}) is never served by this app.
 * Spring Boot would answer it at {@code /} (welcome page) and {@code /index.html} when no Mateu UI
 * sits at the root; those requests answer 404, as before the jars shipped the page. It runs after
 * the SPA fallback, which rewrites a deep link with no owner to {@code /}.
 */
@Component
// after SpaRedirectWebFilter (LOWEST_PRECEDENCE - 10): a deep link it rewrites to "/" is checked
// too
@Order(Ordered.LOWEST_PRECEDENCE - 5)
public class DeployablePageWebFilter implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var request = exchange.getRequest();
    if (!HttpMethod.GET.equals(request.getMethod())
        && !HttpMethod.HEAD.equals(request.getMethod())) {
      return chain.filter(exchange);
    }
    String path = request.getPath().pathWithinApplication().value();
    if (!"/".equals(path) && !"/index.html".equals(path)) {
      return chain.filter(exchange);
    }
    // a root UI's generated index answers /index.html itself (its first route takes any segment)
    if (DeployablePage.hidden(
        path, baseUrls(), Thread.currentThread().getContextClassLoader(), true)) {
      exchange.getResponse().setStatusCode(HttpStatus.NOT_FOUND);
      return exchange.getResponse().setComplete();
    }
    return chain.filter(exchange);
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
