package com.acme.shellyaml;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** The only Java: the shell itself is specs/ui/** (a type: UI mount and a type: AppShell). */
@SpringBootApplication
public class ShellYamlApplication {

  public static void main(String[] args) {
    SpringApplication.run(ShellYamlApplication.class, args);
  }
}
