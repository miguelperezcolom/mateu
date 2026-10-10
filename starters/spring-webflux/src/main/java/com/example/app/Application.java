package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Scans only this package: Mateu's own beans come with its adapter jar (an auto-configuration),
 * so there is no need — and no reason — to scan {@code io.mateu}.
 */
@SpringBootApplication
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
