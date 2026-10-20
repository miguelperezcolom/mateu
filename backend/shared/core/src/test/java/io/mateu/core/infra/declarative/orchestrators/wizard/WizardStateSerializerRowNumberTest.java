package io.mateu.core.infra.declarative.orchestrators.wizard;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The rows of a list in the state get their position ({@code _rowNumber}) and nothing else: a
 * leftover debug line used to plant {@code "nombre": "xxxx"} in every row of every list.
 */
class WizardStateSerializerRowNumberTest {

  public record Room(String type) {}

  @SuppressWarnings("unused")
  static class RoomsStep {
    List<Room> rooms = new ArrayList<>();
  }

  @Test
  void rowsGetTheirPositionAndNoForeignKeys() {
    var rows = new ArrayList<Object>();
    rows.add(new HashMap<>(Map.of("type", "SWU")));
    rows.add(new HashMap<>(Map.of("type", "DBL")));
    var data = new HashMap<String, Object>(Map.of("rooms", rows));

    WizardStateSerializer.addRowNumber(RoomsStep.class, data);

    assertThat(data).containsEntry("rooms_rowClass", Room.class.getName());
    assertThat(rows)
        .containsExactly(
            Map.of("type", "SWU", "_rowNumber", 0), Map.of("type", "DBL", "_rowNumber", 1));
  }
}
