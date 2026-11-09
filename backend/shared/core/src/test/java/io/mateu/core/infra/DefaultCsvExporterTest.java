package io.mateu.core.infra;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.ExportColumn;
import io.mateu.uidl.data.ExportFormat;
import io.mateu.uidl.data.ListingExport;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** The cells of the built-in CSV come from users; the file is opened by somebody else. */
class DefaultCsvExporterTest {

  private static String cell(String value) {
    var export =
        new ListingExport(
            ExportFormat.csv,
            "export",
            List.of(new ExportColumn("a", "A")),
            List.of(Map.of("a", value)),
            null);
    var csv =
        new String(new DefaultCsvExporter().export(export, null).content(), StandardCharsets.UTF_8);
    return csv.substring(csv.indexOf('\n') + 1, csv.length() - 1);
  }

  @Test
  void aFormulaStaysText() {
    assertThat(cell("=HYPERLINK(1)")).isEqualTo("'=HYPERLINK(1)");
    assertThat(cell("+1+cmd")).isEqualTo("'+1+cmd");
    assertThat(cell("-2+3")).isEqualTo("'-2+3");
    assertThat(cell("@SUM(A1)")).isEqualTo("'@SUM(A1)");
    assertThat(cell("\tx")).isEqualTo("'\tx");
  }

  @Test
  void aNumberStaysANumber() {
    assertThat(cell("-12.5")).isEqualTo("-12.5");
    assertThat(cell("+34")).isEqualTo("+34");
    assertThat(cell("plain text")).isEqualTo("plain text");
  }

  @Test
  void aCarriageReturnIsQuotedSoItCannotSplitTheRow() {
    assertThat(cell("a\rb")).isEqualTo("\"a\rb\"");
  }

  @Test
  void aFormulaThatNeedsQuotingIsBothNeutralisedAndQuoted() {
    assertThat(cell("=A1,B1")).isEqualTo("\"'=A1,B1\"");
  }
}
