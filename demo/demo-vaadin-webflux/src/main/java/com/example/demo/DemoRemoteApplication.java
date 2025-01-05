package com.example.demo;

import io.mateu.ReferenceForPackageScanning;
import io.mateu.article2.Article2Client;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication(scanBasePackageClasses = {
        DemoRemoteApplication.class, Article2Client.class
})
@EnableJpaRepositories(
    basePackageClasses = {ReferenceForPackageScanning.class, DemoRemoteApplication.class})
@EntityScan(basePackageClasses = {ReferenceForPackageScanning.class, DemoRemoteApplication.class})
@EnableCaching
public class DemoRemoteApplication {

  public static void main(String[] args) {
    SpringApplication.run(DemoRemoteApplication.class, args);
  }

  @Bean
  public RestTemplate restTemplate() {
    return new RestTemplate();
  }
}
