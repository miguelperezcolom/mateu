package com.example.workshop;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * Workshop, lab 06. Mateu OFFERS the sign-in (application.properties: the Keycloak provider); the
 * browser runs OpenID Connect against Keycloak and sends {@code Authorization: Bearer <token>} on
 * every Mateu call. Checking that token is Spring's job, as for any other client of your API: the
 * page and its assets stay open (the client has to load to sign in), every Mateu call needs a
 * valid token and answers 401 — not a redirect — without one, which is what makes the client sign
 * in.
 */
@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    RequestMatcher api = request -> request.getRequestURI().contains("/mateu/v3/");
    return http.authorizeHttpRequests(
            a -> a.requestMatchers(api).authenticated().anyRequest().permitAll())
        .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
        .exceptionHandling(
            e ->
                e.defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), api))
        .build();
  }
}
