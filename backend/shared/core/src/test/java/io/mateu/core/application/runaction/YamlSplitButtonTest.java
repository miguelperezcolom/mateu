package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ButtonGroup;
import io.mateu.uidl.fluent.Form;
import org.junit.jupiter.api.Test;

/** A YAML {@code ButtonGroup} with a {@code primary:} is a split button, in a toolbar too. */
class YamlSplitButtonTest {

  @Test
  void aButtonGroupWithAPrimaryReadsAsASplitButton() {
    var form =
        (Form)
            new YamlUidlLoader(new RouteRegistry())
                .parseText(
                    """
                    type: Form
                    title: Orders
                    toolbar:
                      - type: ButtonGroup
                        primary: {type: Button, label: Save, actionId: save}
                        buttons:
                          - {type: Button, label: Save as draft, actionId: saveDraft}
                      - type: ButtonGroup
                        label: Export
                        buttons:
                          - {type: Button, label: CSV, actionId: csv}
                    """);
    var split = (ButtonGroup) form.toolbar().get(0);
    assertThat(split.primary().actionId()).isEqualTo("save");
    assertThat(split.buttons()).extracting(Button::actionId).containsExactly("saveDraft");
    var dropdown = (ButtonGroup) form.toolbar().get(1);
    assertThat(dropdown.primary()).isNull();
    assertThat(dropdown.label()).isEqualTo("Export");
  }
}
