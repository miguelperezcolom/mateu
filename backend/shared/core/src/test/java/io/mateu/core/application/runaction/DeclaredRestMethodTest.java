package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * An annotation attribute cannot be "unset": by REFERENCE, a {@code @Rest*} method equal to the
 * annotation default means "the catalogue entry's" (blank), so a by-ref {@code @RestAction} no
 * longer calls a DELETE endpoint with the default POST.
 */
class DeclaredRestMethodTest {

  @Test
  void byReferenceTheDefaultDefersToTheCatalogue() {
    assertThat(DeclaredRestMethod.of("vcn-delete", "POST", "POST")).isEmpty();
    assertThat(DeclaredRestMethod.of("vcns", "GET", "GET")).isEmpty();
  }

  @Test
  void anExplicitMethodOrAnInlineUrlKeepsIt() {
    assertThat(DeclaredRestMethod.of("vcn-delete", "PUT", "POST")).isEqualTo("PUT");
    assertThat(DeclaredRestMethod.of("", "POST", "POST")).isEqualTo("POST");
    assertThat(DeclaredRestMethod.of(null, "GET", "GET")).isEqualTo("GET");
  }
}
