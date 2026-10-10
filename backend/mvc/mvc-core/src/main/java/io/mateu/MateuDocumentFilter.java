package io.mateu;

import io.mateu.core.infra.documents.DocumentDownloads;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * {@code GET <baseUrl>/mateu/v3/documents/<token>}: a document an action produced, served once by
 * {@link DocumentDownloads}.
 *
 * <p>A filter and not a controller for the same reason as {@link MateuClientLogFilter} (the
 * endpoint lives under every UI's base URL). Ordered BEFORE Spring Security's filter chain (-100):
 * the browser fetches the URL from a new tab or a download link, which cannot carry the bearer
 * token the API calls carry, so the single-use, short-lived, 256-bit token is the authorization —
 * it was only ever handed out in the response to an action the user was allowed to run.
 */
@Component
@Order(-101)
public class MateuDocumentFilter extends OncePerRequestFilter {

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return !"GET".equalsIgnoreCase(request.getMethod())
        || !DocumentDownloads.isEndpoint(request.getRequestURI());
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
      throws ServletException, IOException {
    var served = DocumentDownloads.serve(request.getRequestURI());
    response.setStatus(served.status());
    served.headers().forEach(response::setHeader);
    if (served.body().length > 0) {
      response.getOutputStream().write(served.body());
    }
  }
}
