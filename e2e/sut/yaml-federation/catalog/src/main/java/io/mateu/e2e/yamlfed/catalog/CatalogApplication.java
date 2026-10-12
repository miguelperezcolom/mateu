package io.mateu.e2e.yamlfed.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** No UI code here: every screen of this app is a YAML definition under specs/ui. */
@SpringBootApplication(scanBasePackages = "io.mateu.e2e.yamlfed.catalog")
public class CatalogApplication {

  public static void main(String[] args) {
    SpringApplication.run(CatalogApplication.class, args);
  }
}
