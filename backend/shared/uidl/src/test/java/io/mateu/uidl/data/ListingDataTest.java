package io.mateu.uidl.data;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;

import io.mateu.uidl.annotations.GroupBy;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * Custom listings whose row class declares @GroupBy get their group summaries synthesized from the
 * page rows (value + count); rows without @GroupBy, and pages that already carry groups, are left
 * untouched.
 */
class ListingDataTest {

  record GroupedRow(@GroupBy String file, String service) {}

  record PlainRow(String service) {}

  @Test
  void synthesizesOneSummaryPerGroupWithCounts() {
    var data =
        ListingData.of(
                List.of(
                    new GroupedRow("EXP-1", "HOTEL"),
                    new GroupedRow("EXP-1", "TRANSFER"),
                    new GroupedRow("EXP-2", "HOTEL")))
            .withSynthesizedGroups(GroupedRow.class);

    assertEquals(
        List.of(new GroupSummary("EXP-1", 2, Map.of()), new GroupSummary("EXP-2", 1, Map.of())),
        data.groups());
  }

  @Test
  void rowsWithoutGroupByAreLeftUntouched() {
    var data = ListingData.of(List.of(new PlainRow("HOTEL"))).withSynthesizedGroups(PlainRow.class);

    assertNull(data.groups());
  }

  @Test
  void alreadyComputedGroupsWin() {
    var computed = List.of(new GroupSummary("EXP-1", 42, Map.of()));
    var data =
        ListingData.of(List.of(new GroupedRow("EXP-1", "HOTEL")))
            .withGroups(computed)
            .withSynthesizedGroups(GroupedRow.class);

    assertSame(computed, data.groups());
  }
}
