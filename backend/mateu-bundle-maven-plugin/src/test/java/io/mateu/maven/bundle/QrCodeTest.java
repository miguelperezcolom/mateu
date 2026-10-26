package io.mateu.maven.bundle;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import org.junit.Test;

/**
 * The terminal QR code is the web lib's encoder ported to Java: the same text must give the same
 * symbol, module for module. {@code qr-golden.json} was written by {@code encodeQr} of
 * libs/mateu/.../ui/qr/qrEncoder.ts (decode-round-trip tested there) — regenerate it from that file
 * if the encoder ever changes, never from this one.
 */
public class QrCodeTest {

  @Test
  public void everySymbolMatchesTheWebEncoder() throws Exception {
    JsonNode golden;
    try (var in = getClass().getResourceAsStream("/qr-golden.json")) {
      golden = new ObjectMapper().readTree(in);
    }
    assertThat(golden.get("cases")).isNotEmpty();
    for (var c : golden.get("cases")) {
      var qr = QrCode.encode(c.get("text").asText(), QrCode.Ecc.valueOf(c.get("ecc").asText()));
      assertThat(qr.version).as(c.get("text").asText()).isEqualTo(c.get("version").asInt());
      var expected = new ArrayList<String>();
      c.get("rows").forEach(r -> expected.add(r.asText()));
      assertThat(rows(qr)).as(c.get("text").asText()).isEqualTo(expected);
    }
  }

  @Test
  public void theTerminalFormHasTwoModuleRowsPerLineAndAQuietZone() {
    var qr = QrCode.encode("https://mateu.io/add?u=x", QrCode.Ecc.M);
    var lines = qr.toTerminal(2).split("\n");
    assertThat(lines).hasSize((qr.size + 4 + 1) / 2);
    // the first line is quiet zone: white on white
    assertThat(lines[0]).doesNotContain("[30;").doesNotContain(";40m");
  }

  @Test
  public void tooMuchTextIsRefused() {
    assertThatThrownBy(() -> QrCode.encode("x".repeat(3000), QrCode.Ecc.H))
        .isInstanceOf(IllegalArgumentException.class);
  }

  private static List<String> rows(QrCode qr) {
    var out = new ArrayList<String>();
    for (var row : qr.modules) {
      var line = new StringBuilder();
      for (var cell : row) {
        line.append(cell ? '1' : '0');
      }
      out.add(line.toString());
    }
    return out;
  }
}
