package com.example;

import io.mateu.core.infra.security.AuthenticatedPrincipal;
import io.mateu.integrationtests.AdapterParityITFoundation;
import io.mateu.uidl.security.CallerIdentity;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Test-only authentication: a request carrying {@link
 * AdapterParityITFoundation#PARITY_ROLES_HEADER} gets an exchange principal with those roles — what
 * a reactive security filter (Spring Security's, or any other) establishes. The contract checks it
 * reaches Mateu through {@code exchange.getPrincipal()}.
 */
@Component
public class ParityRolesAuthentication implements WebFilter {

  @Override
  public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
    var roles =
        exchange.getRequest().getHeaders().getFirst(AdapterParityITFoundation.PARITY_ROLES_HEADER);
    if (roles == null || roles.isBlank()) {
      return chain.filter(exchange);
    }
    var principal =
        new AuthenticatedPrincipal(
            new CallerIdentity(
                "parity-user",
                Arrays.stream(roles.split(",")).map(String::trim).toList(),
                List.of(),
                List.of(),
                List.of()));
    return chain.filter(exchange.mutate().principal(Mono.just(principal)).build());
  }
}
