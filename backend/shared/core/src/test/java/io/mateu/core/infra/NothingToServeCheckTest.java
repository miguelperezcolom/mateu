package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * An app whose annotation processor did not run used to boot cleanly and answer 404 everywhere with
 * nothing in the log. The startup check names the processor to add.
 */
class NothingToServeCheckTest {

  @Test
  void anAppWithNoRoutedClassAndNoYamlMountIsToldWhichProcessorToAdd() {
    var text = NothingToServeCheck.message(0, false, "mateu-annotation-processor-mvc");

    assertThat(text)
        .contains("no @UI class was processed")
        .contains("io.mateu:mateu-annotation-processor-mvc")
        .contains("<annotationProcessorPaths>")
        .contains("mateu-annotation-processor-indexer");
  }

  @Test
  void aRoutedClassOrAYamlMountIsEnoughToStaySilent() {
    assertThat(NothingToServeCheck.message(1, false, "x")).isNull();
    assertThat(NothingToServeCheck.message(0, true, "x")).isNull();
  }
}
