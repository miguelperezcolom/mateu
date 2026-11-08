package io.mateu.explorer.remote;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** The Explorer's Java remote. Its UI lives in the @UI classes of this package and below. */
@SpringBootApplication
public class JavaRemoteApplication {

  public static void main(String[] args) {
    SpringApplication.run(JavaRemoteApplication.class, args);
  }
}
