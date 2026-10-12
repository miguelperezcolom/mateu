package io.mateu.mdd.demoadminpanel.infra.in.ui.e2;

import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MergeField;
import io.mateu.uidl.data.MergeRecord;
import io.mateu.uidl.data.RecordMerge;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * Compare and merge ({@link RecordMerge}): two guest profiles detected as duplicates, side by side.
 * The rows that differ are highlighted; pick per row which profile's value survives (or type one
 * for the editable rows) and merge. The merge action receives {@code _merged} and {@code
 * _choices}.
 */
@UI("/record-merge-demo")
@Title("Merge duplicate profiles")
@FormLayout(columns = 1)
public class MergeProfilesPage {

  @Notice(theme = "success")
  String result;

  @Label("")
  Callable<Component> merge =
      () ->
          RecordMerge.builder()
              .id("profiles")
              .title("Guest profiles 1021 and 3388 look like the same person")
              .records(
                  List.of(
                      new MergeRecord("1021", "Profile 1021", "Created 3 Mar 2021 · 12 stays"),
                      new MergeRecord("3388", "Profile 3388", "Created 9 Sep 2026 · 1 stay")))
              .fields(
                  List.of(
                      MergeField.of("firstName", "First name", "Ana", "Ana"),
                      MergeField.of("lastName", "Last name", "García López", "Garcia"),
                      MergeField.of("email", "Email", null, "ana.garcia@example.com"),
                      MergeField.of("phone", "Phone", "+34 600 111 222", "+34 699 333 444")
                          .withEditable(true),
                      MergeField.of("address", "Address", "C/ Mayor 1, Palma", "Calle Mayor 1, 07001 Palma")
                          .withEditable(true)
                          .withChosen("3388"),
                      MergeField.of("vip", "VIP", "Gold", "—"),
                      MergeField.of("language", "Language", "Spanish", "Spanish")))
              .mergeActionId("mergeProfiles")
              .mergeLabel("Merge into profile 1021")
              .parameters(Map.of("survivor", "1021", "duplicate", "3388"))
              .build();

  @SuppressWarnings("unchecked")
  public MergeProfilesPage mergeProfiles(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var merged = new LinkedHashMap<String, Object>((Map<String, Object>) parameters.get("_merged"));
    result =
        "Profile "
            + parameters.get("duplicate")
            + " merged into "
            + parameters.get("survivor")
            + ": "
            + merged;
    return this;
  }
}
