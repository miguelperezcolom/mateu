package io.mateu.security;

import io.mateu.core.infra.security.CsrfExemption;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpHeaders;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.csrf.CsrfWebFilter;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatcher.MatchResult;
import org.springframework.web.server.ServerWebExchange;

/**
 * The WebFlux twin of the MVC adapter's {@code MateuCsrfAutoConfiguration}: with Spring Security on
 * the classpath, Mateu's JSON calls skip its CSRF check (see {@link CsrfExemption}); everything
 * else keeps the default protection (every non-safe method). Applied as a top-level {@code
 * Customizer<ServerHttpSecurity.CsrfSpec>} bean, which Spring Security applies to every {@code
 * ServerHttpSecurity} it hands out; an application that sets its own {@code
 * requireCsrfProtectionMatcher} replaces it. Off with {@code
 * mateu.security.csrf-exemption.enabled=false}.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.REACTIVE)
@ConditionalOnClass(name = "org.springframework.security.config.web.server.ServerHttpSecurity")
@ConditionalOnProperty(
    name = CsrfExemption.ENABLED_PROPERTY,
    havingValue = "true",
    matchIfMissing = true)
public class MateuCsrfWebFluxAutoConfiguration {

  /** Spring Security's default (non-safe methods), minus Mateu's JSON calls. */
  public static final ServerWebExchangeMatcher CSRF_PROTECTED =
      exchange ->
          CsrfWebFilter.DEFAULT_CSRF_MATCHER
              .matches(exchange)
              .flatMap(
                  result ->
                      result.isMatch() && !isMateuJsonCall(exchange)
                          ? MatchResult.match()
                          : MatchResult.notMatch());

  static boolean isMateuJsonCall(ServerWebExchange exchange) {
    var request = exchange.getRequest();
    return CsrfExemption.isMateuJsonCall(
        request.getPath().value(), request.getHeaders().getFirst(HttpHeaders.CONTENT_TYPE));
  }

  @Bean
  public Customizer<ServerHttpSecurity.CsrfSpec> mateuCsrfExemption() {
    return csrf -> csrf.requireCsrfProtectionMatcher(CSRF_PROTECTED);
  }
}
