package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * {@code ${secret.X}} falls back to the environment ONLY through {@code MATEU_SECRET_}-prefixed
 * variables: a template must not be able to read just any variable of the process and send it to an
 * endpoint. Mirrored in .NET (UrlTemplateTests) and Python (test_url_template.py).
 */
class SecretEnvFallbackTest {

  @Test
  void theEnvironmentNameCarriesThePrefix() {
    assertThat(RunActionUseCase.secretEnvName("API_TOKEN")).isEqualTo("MATEU_SECRET_API_TOKEN");
    assertThat(RunActionUseCase.secretEnvName("MATEU_SECRET_API_TOKEN"))
        .isEqualTo("MATEU_SECRET_API_TOKEN");
  }

  @Test
  void anUnprefixedVariableOfTheProcessIsNotReadable() {
    // PATH is set in every process; MATEU_SECRET_PATH is not
    assertThat(System.getenv("PATH")).isNotNull();
    var useCase = new RunActionUseCase(null, null, null, null, null, null);
    assertThat(useCase.resolveSecret("PATH")).isNull();
  }
}
