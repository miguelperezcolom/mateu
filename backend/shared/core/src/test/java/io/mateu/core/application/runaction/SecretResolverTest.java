package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * The secret boundary after it moved out of {@link RunActionUseCase}: the same prefix-only
 * environment fallback, and the use case's old entry points answering exactly what it does.
 */
class SecretResolverTest {

  @Test
  void theFallbackIsTheMateuSecretPrefixOnly() {
    assertThat(SecretResolver.SECRET_ENV_PREFIX).isEqualTo("MATEU_SECRET_");
    assertThat(SecretResolver.secretEnvName("API_TOKEN")).isEqualTo("MATEU_SECRET_API_TOKEN");
    assertThat(SecretResolver.secretEnvName("MATEU_SECRET_X")).isEqualTo("MATEU_SECRET_X");
    // PATH is set in every process; MATEU_SECRET_PATH is not
    assertThat(System.getenv("PATH")).isNotNull();
    assertThat(SecretResolver.resolve("PATH")).isNull();
  }

  @Test
  @SuppressWarnings("removal")
  void theUseCaseDelegatesUnchanged() {
    assertThat(RunActionUseCase.SECRET_ENV_PREFIX).isEqualTo(SecretResolver.SECRET_ENV_PREFIX);
    assertThat(RunActionUseCase.secretEnvName("K")).isEqualTo(SecretResolver.secretEnvName("K"));
    assertThat(new RunActionUseCase(null, null, null, null, null, null).resolveSecret("PATH"))
        .isNull();
  }
}
