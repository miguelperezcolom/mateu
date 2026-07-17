package io.mateu.uidl.interfaces;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import io.mateu.uidl.annotations.GroupAction;
import io.mateu.uidl.data.GroupSummary;
import io.mateu.uidl.data.ListingData;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * GroupActions.applyVisibility asks a GroupActionVisibility listing per group and per
 * {@code @GroupAction} method, and records the hidden ones on the group summaries.
 */
class GroupActionsTest {

  record Row(String file) {}

  static class CancellableListing implements GroupActionVisibility {

    @GroupAction("Cancel file")
    public Object cancelFile(HttpRequest httpRequest) {
      return null;
    }

    @Override
    public boolean groupActionVisible(String methodName, String groupValue, HttpRequest request) {
      return !"EXP-2".equals(groupValue);
    }
  }

  private ListingData<Row> dataWithGroups() {
    return ListingData.of(List.of(new Row("EXP-1"), new Row("EXP-2")))
        .withGroups(
            List.of(
                new GroupSummary("EXP-1", 1, Map.of()), new GroupSummary("EXP-2", 1, Map.of())));
  }

  @Test
  void hidesTheActionOnTheGroupsTheListingVetoes() {
    var data = GroupActions.applyVisibility(new CancellableListing(), dataWithGroups(), null);

    assertNull(data.groups().get(0).hiddenActions());
    assertEquals(List.of("cancelFile"), data.groups().get(1).hiddenActions());
  }

  @Test
  void listingsWithoutTheVisibilityHookAreLeftUntouched() {
    var data = dataWithGroups();

    assertEquals(data, GroupActions.applyVisibility(new Object(), data, null));
  }
}
