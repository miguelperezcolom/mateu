package io.mateu.security;

import io.mateu.core.infra.security.CsrfExemption;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.CsrfConfigurer;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * With Spring Security on the classpath, Mateu's JSON calls ({@code <baseUrl>/mateu/v3/**}, {@code
 * /mateu/mcp}) skip its CSRF check — see {@link CsrfExemption} for why that is safe. Without it the
 * documented setup ("add Spring Security") answered every action with 403.
 *
 * <p>Applied as a top-level {@code Customizer<CsrfConfigurer<HttpSecurity>>} bean, which Spring
 * Security applies to every {@code HttpSecurity} it hands out — the application's own {@code
 * SecurityFilterChain} included, before its own {@code csrf(...)} customization, which still adds
 * to (or disables) it. Off with {@code mateu.security.csrf-exemption.enabled=false}.
 */
@AutoConfiguration
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
@ConditionalOnClass(
    name = "org.springframework.security.config.annotation.web.configurers.CsrfConfigurer")
@ConditionalOnProperty(
    name = CsrfExemption.ENABLED_PROPERTY,
    havingValue = "true",
    matchIfMissing = true)
public class MateuCsrfAutoConfiguration {

  /** The requests Spring Security's CSRF check leaves to Mateu. */
  public static final RequestMatcher MATEU_JSON_CALLS =
      (HttpServletRequest request) ->
          CsrfExemption.isMateuJsonCall(request.getRequestURI(), request.getContentType());

  @Bean
  public Customizer<CsrfConfigurer<HttpSecurity>> mateuCsrfExemption() {
    return csrf -> csrf.ignoringRequestMatchers(MATEU_JSON_CALLS);
  }
}
