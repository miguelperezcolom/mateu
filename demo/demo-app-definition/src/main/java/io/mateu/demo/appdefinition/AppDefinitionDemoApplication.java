package io.mateu.demo.appdefinition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * A Mateu app with NO Java {@code @UI} class: the whole mount — its app shell (title, menu, widgets)
 * AND its pages — is authored as data in {@code src/main/resources/specs/ui/}. {@code routes.yaml}
 * carries an {@code app:} block for the shell and a {@code routes:} list binding each URL to a page
 * definition. Served at the deployment root.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class AppDefinitionDemoApplication {

  public static void main(String[] args) {
    SpringApplication.run(AppDefinitionDemoApplication.class, args);
  }
}
