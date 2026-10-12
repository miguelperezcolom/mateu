package io.mateu.e2e.yamlfed.console;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** No UI code here: every screen of this app is a YAML definition under specs/ui. */
@SpringBootApplication(scanBasePackages = "io.mateu.e2e.yamlfed.console")
public class ConsoleApplication {

  public static void main(String[] args) {
    SpringApplication.run(ConsoleApplication.class, args);
  }
}
