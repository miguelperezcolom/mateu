package com.example.parity;

import io.mateu.integrationtests.AdapterParityITFoundation;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.intercept.AuthorizationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

/** The app the MVC adapter's parity tests boot: the {@link HelloWorld} UI and nothing else. */
@SpringBootApplication
public class ParityApp {

  // Spring Security is on the test classpath (for the static-asset test); open everything here.
  @Bean
  SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
    // the Mateu endpoints are JSON POSTs from the same origin, authenticated (when at all) by a
    // Bearer token, not a cookie: CSRF tokens do not apply to them — everything else keeps CSRF
    return http.csrf(csrf -> csrf.ignoringRequestMatchers("/mateu/**", "/*/mateu/**"))
        .addFilterBefore(new ParityRolesAuthentication(), AuthorizationFilter.class)
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .build();
  }

  /**
   * Test-only authentication: a request carrying {@link
   * AdapterParityITFoundation#PARITY_ROLES_HEADER} is authenticated as a Spring Security {@code
   * Authentication} with those roles — what a real JWT/OAuth2 resource server would establish.
   */
  static class ParityRolesAuthentication extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(
        HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException {
      var roles = request.getHeader(AdapterParityITFoundation.PARITY_ROLES_HEADER);
      if (roles != null && !roles.isBlank()) {
        var context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(
            UsernamePasswordAuthenticationToken.authenticated(
                "parity-user",
                null,
                Arrays.stream(roles.split(","))
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim()))
                    .toList()));
        SecurityContextHolder.setContext(context);
      }
      chain.doFilter(request, response);
    }
  }
}
