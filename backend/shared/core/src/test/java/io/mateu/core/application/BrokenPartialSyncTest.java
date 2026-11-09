package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import io.mateu.core.application.runaction.PartialExpander;
import io.mateu.core.application.runaction.PartialRegistry;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

/**
 * A YAML partial that cannot be read (here a ResponsiveGrid whose {@code columns} is written as a
 * string) used to render as NOTHING and say nothing a developer could act on. It now reports the
 * file, the path inside it and the reason, once per file.
 */
class BrokenPartialSyncTest {

  private ListAppender<ILoggingEvent> logs;
  private Logger logger;

  @BeforeEach
  void capture() {
    PartialRegistry.instance().reset();
    logger = (Logger) LoggerFactory.getLogger(PartialRegistry.class);
    logs = new ListAppender<>();
    logs.start();
    logger.addAppender(logs);
  }

  @AfterEach
  void release() {
    logger.detachAppender(logs);
    PartialRegistry.instance().reset();
  }

  @Test
  void aPartialThatCannotBeReadSaysWhichFileWhereAndWhy() {
    var expanded =
        (VerticalLayout)
            PartialExpander.expand(new VerticalLayout(new Partial("broken-grid")), null);

    var reports =
        logs.list.stream()
            .filter(e -> e.getLevel().isGreaterOrEqual(Level.WARN))
            .map(ILoggingEvent::getFormattedMessage)
            .toList();
    assertThat(reports)
        .anySatisfy(
            message ->
                assertThat(message)
                    .contains("specs/ui/partials/broken-grid.yaml")
                    // where in the file: the second component, its columns
                    .contains("content[1]")
                    .contains("columns"));

    // the components that could be read still render: one broken piece does not blank the rest
    List<Component> content = expanded.content();
    assertThat(content).anySatisfy(c -> assertThat(c).isInstanceOf(Text.class));
    assertThat(content)
        .filteredOn(c -> c instanceof Text t && "Before the grid".equals(t.text()))
        .hasSize(1);
    // outside dev mode the broken piece is only reported, not drawn
    assertThat(content).noneMatch(c -> c instanceof io.mateu.uidl.data.Notice);
  }

  @Test
  void inDevModeTheBrokenPieceIsAVisiblePlaceholder() {
    io.mateu.core.infra.dev.DevMode.reset();
    System.setProperty("mateu.dev", "true");
    try {
      var expanded =
          (VerticalLayout)
              PartialExpander.expand(new VerticalLayout(new Partial("broken-grid")), null);
      assertThat(expanded.content())
          .filteredOn(c -> c instanceof io.mateu.uidl.data.Notice)
          .singleElement()
          .satisfies(
              notice -> {
                var n = (io.mateu.uidl.data.Notice) notice;
                assertThat(n.theme()).isEqualTo("danger");
                assertThat(n.text()).contains("broken-grid.yaml").contains("content[1].columns");
              });
    } finally {
      System.clearProperty("mateu.dev");
      io.mateu.core.infra.dev.DevMode.reset();
    }
  }
}
