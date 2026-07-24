package io.mateu.redwoodvb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SUT backend for the Mateu-on-Visual-Builder renderer ({@code frontend/web/monorepo/apps/redwood-vb}).
 *
 * <p>It is an ordinary Mateu Spring MVC service: it exposes the standard {@code
 * /mateu/v3/components/_/action} wire model on port 9001. The VB bridge kit (a separate frontend
 * running inside a Visual Builder app, or the local dev harness in {@code apps/redwood-vb}) calls
 * this endpoint and renders the {@code UIIncrementDto} with authentic {@code oj-sp}/{@code oj-c}
 * components. The Mateu backend is renderer-agnostic — nothing here is VB-specific.
 *
 * <p>Add {@code @UI}/{@code @Route} screens under {@code io.mateu.redwoodvb.ui}; they are generated
 * as controllers at compile time. Screens are added phase by phase per {@code
 * .dev/vb/RENDERER-ROADMAP.md}.
 */
@SpringBootApplication
public class RedwoodVbDemoApplication {

  public static void main(String[] args) {
    SpringApplication.run(RedwoodVbDemoApplication.class, args);
  }
}
