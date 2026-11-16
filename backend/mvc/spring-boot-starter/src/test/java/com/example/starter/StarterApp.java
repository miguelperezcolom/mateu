package com.example.starter;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A Spring Boot application as a user writes it with the starter: a main class and a {@code @UI}
 * class ({@link HelloPage}). No Mateu configuration, no component scan of {@code io.mateu}.
 */
@SpringBootApplication
public class StarterApp {

  public static void main(String[] args) {
    SpringApplication.run(StarterApp.class, args);
  }
}
