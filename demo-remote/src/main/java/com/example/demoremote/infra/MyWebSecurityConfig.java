package com.example.demoremote.infra;

/*
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.server.SecurityWebFilterChain;

 */

// @EnableWebFluxSecurity
public class MyWebSecurityConfig {
  /*

      @Bean
      public MapReactiveUserDetailsService userDetailsService() {
          UserDetails user = User.withDefaultPasswordEncoder()
                  .username("user")
                  .password("user")
                  .roles("USER")
                  .build();
          return new MapReactiveUserDetailsService(user);
      }


      @Bean
      public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
          http.csrf().disable()
                  .authorizeExchange(exchanges -> exchanges
                          //.anyExchange().authenticated()
                          .anyExchange().permitAll()
                  )
                  //.httpBasic(withDefaults())
                  //.formLogin(withDefaults())
          ;
          return http.build();
      }
  */
}
