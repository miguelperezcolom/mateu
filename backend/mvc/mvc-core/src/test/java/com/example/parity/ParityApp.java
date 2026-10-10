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
    return http.csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .build();
  }
}
