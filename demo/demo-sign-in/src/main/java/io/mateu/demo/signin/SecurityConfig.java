package io.mateu.demo.signin;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.savedrequest.HttpSessionRequestCache;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;

/**
 * Spring Security owns the login (oauth2Login against GitHub) and the session cookie. Mateu only
 * offers the sign-in: the page is open, so the client can boot and send the browser to
 * /oauth2/authorization/github; every Mateu call needs a signed-in user and answers 401 — not
 * a redirect to a login page — when there is none, which is what makes the client sign in again.
 */
@Configuration
public class SecurityConfig {

  @Bean
  SecurityFilterChain security(HttpSecurity http) throws Exception {
    RequestMatcher mateuCalls = request -> request.getRequestURI().startsWith("/mateu/");
    // Spring returns the user, after the login, to the last request it refused. With Mateu that is
    // always one of its calls (a sync POST, the PWA manifest…), never a page: the page itself is
    // open. So only pages are remembered, and after signing in the user is back on the app.
    HttpSessionRequestCache pagesOnly = new HttpSessionRequestCache();
    pagesOnly.setRequestMatcher(request -> !mateuCalls.matches(request));
    http.authorizeHttpRequests(
            a -> a.requestMatchers(mateuCalls).authenticated().anyRequest().permitAll())
        .requestCache(c -> c.requestCache(pagesOnly))
        .oauth2Login(Customizer.withDefaults())
        .exceptionHandling(
            e ->
                e.defaultAuthenticationEntryPointFor(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED), mateuCalls))
        // Mateu's Sign out button is a plain navigation (mateu.auth.logout-url=/logout).
        .logout(
            l ->
                l.logoutRequestMatcher(
                        PathPatternRequestMatcher.withDefaults().matcher(HttpMethod.GET, "/logout"))
                    .logoutSuccessUrl("/"));
    return http.build();
  }
}
