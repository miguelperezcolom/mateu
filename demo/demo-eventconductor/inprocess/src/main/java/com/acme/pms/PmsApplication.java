package com.acme.pms;

import io.mateu.workflow.autoconfigure.WorkflowEmbeddedApplication;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.AutoConfigurationPackage;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * A Mateu application ({@code com.acme.pms}) with the EventConductor engine embedded.
 *
 * <p>{@code @WorkflowEmbeddedApplication} is EventConductor's replacement for
 * {@code @SpringBootApplication}: it scans the engine and this package but deliberately leaves out
 * the engine's UI layer. That layer — a Mateu UI module, package {@code
 * io.mateu.workflow.infra.in.ui} — is mounted by {@code mateu.ui.modules} in
 * application.properties. The two JPA annotations bring back the engine's entities and
 * repositories, which its screens read.
 */
@WorkflowEmbeddedApplication
@EnableJpaRepositories(basePackages = "io.mateu.workflow.infra.out.persistence")
@AutoConfigurationPackage(basePackages = "io.mateu.workflow.infra.out.persistence")
public class PmsApplication {

  public static void main(String[] args) {
    SpringApplication.run(PmsApplication.class, args);
  }
}
