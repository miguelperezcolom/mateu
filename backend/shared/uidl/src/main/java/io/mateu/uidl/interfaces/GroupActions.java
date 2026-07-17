package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.GroupAction;
import io.mateu.uidl.data.GroupSummary;
import io.mateu.uidl.data.ListingData;
import java.lang.reflect.Method;
import java.util.Arrays;

/**
 * When the listing implements {@link GroupActionVisibility}, asks it per group and per
 * {@code @GroupAction} method and records the hidden ones on each {@link GroupSummary}, so the
 * group header rows only render the applicable actions.
 */
public final class GroupActions {

  public static <Row> ListingData<Row> applyVisibility(
      Object listing, ListingData<Row> data, HttpRequest httpRequest) {
    if (!(listing instanceof GroupActionVisibility visibility)
        || data == null
        || data.groups() == null
        || data.groups().isEmpty()) {
      return data;
    }
    var actionMethods =
        Arrays.stream(listing.getClass().getMethods())
            .filter(method -> method.isAnnotationPresent(GroupAction.class))
            .map(Method::getName)
            .toList();
    if (actionMethods.isEmpty()) {
      return data;
    }
    return data.withGroups(
        data.groups().stream()
            .map(
                group -> {
                  var hidden =
                      actionMethods.stream()
                          .filter(
                              method ->
                                  !visibility.groupActionVisible(
                                      method, group.value(), httpRequest))
                          .toList();
                  return hidden.isEmpty()
                      ? group
                      : new GroupSummary(group.value(), group.count(), group.aggregates(), hidden);
                })
            .toList());
  }

  private GroupActions() {}
}
