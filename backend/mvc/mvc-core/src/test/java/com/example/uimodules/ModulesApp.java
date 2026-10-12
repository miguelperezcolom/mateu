package com.example.uimodules;

import io.mateu.EnableMateuUiModules;
import io.mateu.thirdparty.ui.ThirdPartyHome;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

/** An app mounting the third-party module by annotation (type-safe, by one of its classes). */
@SpringBootApplication
@EnableMateuUiModules(basePackageClasses = ThirdPartyHome.class)
public class ModulesApp {

  @Bean
  SecurityFilterChain permitAll(HttpSecurity http) throws Exception {
    return http.csrf(csrf -> csrf.ignoringRequestMatchers("/mateu/**", "/*/mateu/**"))
        .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
        .build();
  }
}
