package io.mateu;

import io.mateu.core.application.DefaultMateuService;
import io.mateu.core.application.runaction.RunActionUseCase;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Default;
import jakarta.enterprise.inject.Specializes;
import jakarta.inject.Inject;

/**
 * Makes the framework's {@link DefaultMateuService} an {@code @ApplicationScoped} CDI bean so the
 * generated JAX-RS controllers can {@code @Inject MateuService}. {@code DefaultMateuService} lives
 * in the framework-neutral core with only {@code jakarta.inject} metadata, which Weld does not
 * treat as a bean under {@code annotated} discovery; specializing it here (in the adapter, a bean
 * archive) supplies the bean without every application having to declare it — the Helidon MP
 * equivalent of what Quarkus Arc / Micronaut do automatically.
 */
@ApplicationScoped
@Default
@Specializes
public class HelidonMateuService extends DefaultMateuService {

  @Inject
  public HelidonMateuService(RunActionUseCase runActionUseCase) {
    super(runActionUseCase);
  }
}
