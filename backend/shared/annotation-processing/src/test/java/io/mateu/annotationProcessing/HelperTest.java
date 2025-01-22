package io.mateu.annotationProcessing;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

import org.junit.Test;

public class HelperTest {

  @Test
  public void returnsEmptyString() {

    assertThat(new Helper()).isNotNull();

    var r = Helper.capitalize(null);
    assertThat(r).isNull();

    r = Helper.capitalize("");
    assertThat(r).isEqualTo("");

    r = Helper.capitalize("", false);
    assertThat(r).isEqualTo("");
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
