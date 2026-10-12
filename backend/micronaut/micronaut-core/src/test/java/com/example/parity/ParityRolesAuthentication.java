package com.example.parity;

import io.mateu.core.infra.security.AuthenticatedPrincipal;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.mateu.uidl.security.CallerIdentity;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.MutableHttpResponse;
import io.micronaut.http.annotation.Filter;
import io.micronaut.http.filter.HttpServerFilter;
import io.micronaut.http.filter.ServerFilterChain;
import java.util.Arrays;
import java.util.List;
import org.reactivestreams.Publisher;

/**
 * Test-only authentication: a request carrying {@link
 * AdapterParityITFoundation#PARITY_ROLES_HEADER} gets a request principal with those roles — where
 * micronaut-security puts the {@code Authentication} it established.
 */
@Filter("/**")
public class ParityRolesAuthentication implements HttpServerFilter {

  @Override
  public Publisher<MutableHttpResponse<?>> doFilter(
      HttpRequest<?> request, ServerFilterChain chain) {
    var roles = request.getHeaders().get(AdapterParityITFoundation.PARITY_ROLES_HEADER);
    if (roles != null && !roles.isBlank()) {
      request.setUserPrincipal(
          new AuthenticatedPrincipal(
              new CallerIdentity(
                  "parity-user",
                  Arrays.stream(roles.split(",")).map(String::trim).toList(),
                  List.of(),
                  List.of(),
                  List.of())));
    }
    return chain.proceed(request);
  }
}
