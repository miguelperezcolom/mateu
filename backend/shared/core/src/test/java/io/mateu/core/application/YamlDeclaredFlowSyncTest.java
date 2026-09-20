package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UICommandTypeDto;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Verifies whether a classless YAML page can author a declared FLOW (`steps:` on an action) — the
 * gap the visual-editor thread handed to coherence (design/coherence-execution.md). If this is
 * green, the runtime deserialises the flow Step verbs from YAML and lowers them to wire commands.
 */
class YamlDeclaredFlowSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aClasslessYamlActionCarriesItsDeclaredFlowAsCommands() {
    var increment = mateu.sync("/yaml-flow");
    var component = (ServerSideComponentDto) increment.fragments().get(0).component();
    var action =
        component.actions().stream()
            .filter(a -> "saveAndClose".equals(a.id()))
            .findFirst()
            .orElseThrow();
    assertThat(action.commands()).as("the YAML steps should lower to wire commands").hasSize(3);
    assertThat(action.commands())
        .extracting(c -> c.type())
        .containsExactly(
            UICommandTypeDto.MarkAsClean, UICommandTypeDto.CloseModal, UICommandTypeDto.NavigateTo);
  }
}
