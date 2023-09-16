package com.example.demoremote;

import io.mateu.ReferenceForPackageScanning;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
@EnableJpaRepositories(
    basePackageClasses = {ReferenceForPackageScanning.class, DemoRemoteApplication.class})
@EntityScan(basePackageClasses = {ReferenceForPackageScanning.class, DemoRemoteApplication.class})
public class DemoRemoteApplication {

  public static void main(String[] args) {
    SpringApplication.run(DemoRemoteApplication.class, args);
  }

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
