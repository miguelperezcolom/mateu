package io.mateu.core.infra.declarative.orchestrators.importwizard;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class CsvParserTest {

  @Test
  void parsesCommaSeparatedRows() {
    var rows = CsvParser.parse("a,b,c\n1,2,3\n");
    assertThat(rows).containsExactly(List.of("a", "b", "c"), List.of("1", "2", "3"));
  }

  @Test
  void detectsSemicolonAsSeparatorWhenItDominatesTheFirstLine() {
    var rows = CsvParser.parse("a;b;c\n1;2;3");
    assertThat(rows).containsExactly(List.of("a", "b", "c"), List.of("1", "2", "3"));
  }

  @Test
  void quotedFieldsMayEmbedTheSeparator() {
    var rows = CsvParser.parse("name,notes\nAda,\"loves, commas\"");
    assertThat(rows.get(1)).containsExactly("Ada", "loves, commas");
  }

  @Test
  void doubledQuotesEscapeAQuoteInsideAQuotedField() {
    var rows = CsvParser.parse("a\n\"say \"\"hi\"\"\"");
    assertThat(rows.get(1)).containsExactly("say \"hi\"");
  }

  @Test
  void quotedFieldsMayEmbedNewlines() {
    var rows = CsvParser.parse("a,b\n\"line1\nline2\",x");
    assertThat(rows).hasSize(2);
    assertThat(rows.get(1)).containsExactly("line1\nline2", "x");
  }

  @Test
  void carriageReturnLineFeedAndBlankTrailingLinesAreHandled() {
    var rows = CsvParser.parse("a,b\r\n1,2\r\n\r\n");
    assertThat(rows).containsExactly(List.of("a", "b"), List.of("1", "2"));
  }

  @Test
  void semicolonDetectionIgnoresSeparatorsInsideQuotes() {
    // the quoted cell hides two semicolons; the real separator is the comma
    var rows = CsvParser.parse("\"a;;\",b\n1,2");
    assertThat(rows.get(0)).containsExactly("a;;", "b");
    assertThat(rows.get(1)).containsExactly("1", "2");
  }

  @Test
  void blankContentParsesToNoRows() {
    assertThat(CsvParser.parse(null)).isEmpty();
    assertThat(CsvParser.parse("   ")).isEmpty();
  }
}
