package io.mateu.agent.cli.companion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * The local companion: a tiny process on the USER's machine serving the chat's SSE contract by
 * bridging to their authenticated LLM CLI — so an app served from a REMOTE server still chats with
 * no api key. Consent is explicit twice: the user starts this process naming which origin may use
 * it, and the chat shows it is talking to the local agent.
 *
 * <pre>
 *   java -jar agent-cli-companion.jar --mateu.agent.companion.allow-origins=https://modux.acme.com
 * </pre>
 */
@SpringBootApplication(scanBasePackages = "io.mateu.agent.cli")
public class AgentCompanion {

  public static void main(String[] args) {
    System.setProperty("server.address", System.getProperty("server.address", "127.0.0.1"));
    System.setProperty("server.port", System.getProperty("server.port", "8776"));
    SpringApplication.run(AgentCompanion.class, args);
  }

  /** CORS: ONLY the origins the user named at startup may drive their CLI. */
  @Bean
  WebMvcConfigurer corsFromFlag(
      @org.springframework.beans.factory.annotation.Value("${mateu.agent.companion.allow-origins:}")
          String origins) {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        if (origins.isBlank()) {
          System.err.println(
              "[companion] SIN --mateu.agent.companion.allow-origins: "
                  + "solo se acepta el mismo origen (localhost). Nómbralo para usarlo desde una app remota.");
          return;
        }
        registry.addMapping("/**").allowedOrigins(origins.split(",")).allowedMethods("GET", "POST");
      }
    };
  }
}
