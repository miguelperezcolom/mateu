package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import org.junit.jupiter.api.Test;

/**
 * A YAML row with no {@code spacing:} is spaced (an image beside a form came out glued to it) — the
 * default the .NET and Python YAML builders always had; {@code spacing: false} still turns it off,
 * and a column keeps the record default.
 */
class YamlLayoutSpacingTest {

  private final com.fasterxml.jackson.databind.ObjectMapper mapper = YamlUidlMapperFactory.create();

  private Component read(String yaml) throws Exception {
    return mapper.readValue(yaml, Component.class);
  }

  @Test
  void aRowWithNoSpacingKeyIsSpaced() throws Exception {
    var column =
        (VerticalLayout)
            read(
                """
                type: VerticalLayout
                content:
                  - type: HorizontalLayout
                    content: [{type: Text, text: a}, {type: Text, text: b}]
                """);
    assertThat(((HorizontalLayout) column.content().get(0)).spacing()).isTrue();
    assertThat(column.spacing()).as("a column keeps the record default").isFalse();
  }

  @Test
  void anExplicitFalseStillTurnsItOff() throws Exception {
    var row =
        (HorizontalLayout)
            read(
                """
                type: HorizontalLayout
                spacing: false
                content: [{type: Text, text: a}]
                """);
    assertThat(row.spacing()).isFalse();
  }

  @Test
  void anEmptyRowIsSpacedToo() throws Exception {
    assertThat(((HorizontalLayout) read("type: HorizontalLayout")).spacing()).isTrue();
  }
}
