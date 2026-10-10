package com.example.parity;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/** The app the MVC adapter's parity tests boot: the {@link HelloWorld} UI and nothing else. */
@SpringBootApplication
public class ParityApp {

  // Spring Security is on the test classpath (for the static-asset test); open everything here.
  @Bean
  SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
    // the Mateu endpoints are JSON POSTs from the same origin, authenticated (when at all) by a
    // Bearer token, not a cookie: CSRF tokens do not apply to them — everything else keeps CSRF
    return http.csrf(csrf -> csrf.ignoringRequestMatchers("/mateu/**", "/*/mateu/**"))
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .build();
  }
}
