package io.mateu.explorer.yamlremote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** The only Java in the YAML remote: every screen is a file under specs/ui. */
@SpringBootApplication
public class YamlRemoteApplication {

  public static void main(String[] args) {
    SpringApplication.run(YamlRemoteApplication.class, args);
  }
}
