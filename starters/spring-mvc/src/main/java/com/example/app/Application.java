package com.example.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** Scans {@code io.mateu} too, so the framework's beans are picked up next to yours. */
@SpringBootApplication(scanBasePackages = {"io.mateu", "com.example.app"})
public class Application {

  public static void main(String[] args) {
    SpringApplication.run(Application.class, args);
  }
}
