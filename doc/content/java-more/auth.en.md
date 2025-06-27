---
title: "Auth"
weight: 20
---

Here we will check how to deal with authentication and authorization (authz and authn) for your UI.

# Do it outside of Mateu

Mateu UIs are web applications, so all of the authentication mechanisms already available (http basic authentication, JAAS web filters, ...) can be used with Mateu UIs and you can do all of the authentication configuration out of Mateu.

So, if you want to protect your UI in an authenticated or not mode (without roles), you only need to configure your http server or do it using Spring Security, whatever you prefer.

# If you are using Keycloak
If you are using keycloak you can just follow these steps...

## Add keycloak to the frontend component

If you are using the default frontend from Mateu you just need to use the `@KeycloakSecured` annotation to our UI class as follows:

```java

  @MateuUI("")
  @KeycloakSecured(url = "https://lemur-18.cloud-iam.com/auth", realm = "mateu", clientId = "demo")
  public class Home {

  }

```

If you just have copy/pasted the code above, you can use `test`/`test` as user/password.


## Protect your endpoints

In order to protect your endpoints you only need to add Spring security as usual. So, in your `pom.xml` add the dependencies:

```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
```

Then you need to add the configuration in your `application.yml` file:

```yml

spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://lemur-18.cloud-iam.com/auth/realms/mateu

```

It might be useful to also increase the log level for spring security:

```yml

logging:
  level:
    org:
      springframework:
        security: DEBUG


```


And finally add a class for disabling cssrf and setting urls protection:

```java

@EnableWebFluxSecurity
@Configuration
public class WebSecurityConfig {

    @Bean
    SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/mateu/**").authenticated()
                        .anyExchange().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(withDefaults())
                );
        return http.build();
    }

}

```


# Fine grained UI

If you want a fine grained access controls you can use the `@Private` and `@ReadOnly` annotations in order to hide menu options, actions and fields, or in order to make a field read only according to the user and its roles.

For that to work you need to implement the interface `MateuSecurityManager` and provide your own implementation, or you can simply add the following dependency:

```xml
  <dependency>
    <groupId>io.mateu</groupId>
    <artifactId>springboot-security</artifactId>
    <version>3.0-alpha.90</version>
  </dependency>
```

  
