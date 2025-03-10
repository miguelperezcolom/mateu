package io.mateu.annotationprocessing;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.Test;

public class HelperTest {

  @Test
  public void returnsEmptyString() {

    var r = Helper.capitalize(null);
    assertThat(r).isNull();

    r = Helper.capitalize("");
    assertThat(r).isEmpty();

    r = Helper.capitalize("", false);
    assertThat(r).isEmpty();
  }

  @Test
  public void returnsCapilatizedString() {
    var r = Helper.capitalize("mateu");
    assertThat(r).isEqualTo("Mateu");

    r = Helper.capitalize("mateu.es.el.mejor");
    assertThat(r).isEqualTo("Mateu es el mejor");

    r = Helper.capitalize("mateu.es.el.mejor", false);
    assertThat(r).isEqualTo("mateu es el mejor");

    r = Helper.capitalize("  mateu.es.el.mejor", false);
    assertThat(r).isEqualTo(" mateu es el mejor");

    r = Helper.capitalize("  ", true);
    assertThat(r).isEqualTo(" ");
  }
}
