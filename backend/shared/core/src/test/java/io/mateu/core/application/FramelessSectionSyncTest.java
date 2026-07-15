package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CardDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Frameless sections: @Section(frameless=true) drops the outlined section card (and its padding) so
 * the section content sits bare on the page, while the other sections keep their card.
 */
class FramelessSectionSyncTest {

  @SuppressWarnings("unused")
  @UI("/frameless")
  @Title("Frameless")
  public static class BandForm {
    @Section(value = "Banda", frameless = true)
    @Label("Aviso")
    String aviso = "sin marco";

    @Section("Datos")
    @Label("Nombre")
    String nombre = "María";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BandForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void framelessSectionEmitsNoCardWhileTheOthersKeepTheirs() {
    var increment = mateu.sync("/frameless");
    var cards = FieldKindsSyncTest.collect(increment.fragments().get(0).component(), CardDto.class);
    assertThat(cards).hasSize(1);
  }
}
