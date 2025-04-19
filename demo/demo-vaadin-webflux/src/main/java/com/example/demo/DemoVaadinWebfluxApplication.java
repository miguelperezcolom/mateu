package com.example.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class DemoVaadinWebfluxApplication {

  public static void main(String[] args) {
    SpringApplication.run(DemoVaadinWebfluxApplication.class, args);
  }

}
