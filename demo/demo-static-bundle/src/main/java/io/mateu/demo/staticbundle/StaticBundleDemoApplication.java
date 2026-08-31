package io.mateu.demo.staticbundle;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Minimal Mateu app that demonstrates the static bundle. Once running it exposes {@code GET
 * /mateu/v3/bundle} (the runtime endpoint, no build step); {@code mvn -Pbundle package} produces the
 * same bundle as a static site under {@code target/mateu-bundle/}. See README.md.
 */
@SpringBootApplication(scanBasePackages = "io.mateu")
public class StaticBundleDemoApplication {

  public static void main(String[] args) {
    SpringApplication.run(StaticBundleDemoApplication.class, args);
  }
}
