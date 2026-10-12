package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

/**
 * {@code actionId()} is the DECLARED id; {@code resolvedActionId()} is what the button dispatches
 * (and what reaches the wire) — declared, else derived from the label.
 */
class ButtonActionIdTest {

  @Test
  void theDeclaredIdWins() {
    var button = new Button("Save draft", "persist");
    assertThat(button.actionId()).isEqualTo("persist");
    assertThat(button.resolvedActionId()).isEqualTo("persist");
  }

  @Test
  void withoutADeclaredIdItIsDerivedFromTheLabel() {
    var button = Button.builder().label("Save draft").build();
    assertThat(button.actionId()).isNull();
    assertThat(button.resolvedActionId()).isEqualTo("saveDraft");
  }

  @Test
  void neitherIdNorLabelResolvesToNull() {
    assertThat(Button.builder().build().resolvedActionId()).isNull();
  }

  @Test
  @SuppressWarnings("removal")
  void theDeprecatedGetterReturnsTheSameValue() {
    var button = Button.builder().label("Save draft").build();
    assertThat(button.getActionId()).isEqualTo(button.resolvedActionId());
  }
}
