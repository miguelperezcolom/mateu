package io.mateu.mdd.demovbpms.infra.in.ui.frontdesk;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Notice;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.MergeField;
import io.mateu.uidl.data.MergeRecord;
import io.mateu.uidl.data.RecordMerge;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;

/**
 * OPERA's profile merge (Client Relations › Profiles › Merge): two guest profiles detected as
 * duplicates, side by side; the rows that differ are highlighted, pick per attribute which profile
 * survives (or type a value for the editable ones) and merge — the action receives {@code _merged}
 * and {@code _choices}.
 */
@Title("Merge profiles")
public class MergeProfiles {

  @Notice(theme = "success")
  String result;

  @Label("")
  Callable<Component> merge =
      () ->
          RecordMerge.builder()
              .id("profiles")
              .title("Possible duplicate: Pierre Brown")
              .records(
                  List.of(
                      new MergeRecord("P-1021", "Profile P-1021", "Since 2019 · 14 stays · Gold"),
                      new MergeRecord("P-3388", "Profile P-3388", "Created at check-in · 1 stay")))
              .fields(
                  List.of(
                      MergeField.of("firstName", "First name", "Pierre", "Pierre"),
                      MergeField.of("lastName", "Last name", "Brown", "Browne"),
                      MergeField.of("email", "Email", null, "pierre.brown@example.com"),
                      MergeField.of("phone", "Phone", "+33 6 11 22 33 44", "+33 6 99 88 77 66")
                          .withEditable(true),
                      MergeField.of("address", "Address", "12 Rue de Rivoli, Paris", "12 rue Rivoli 75001")
                          .withEditable(true)
                          .withChosen("P-1021"),
                      MergeField.of("membership", "Membership", "Gold", null),
                      MergeField.of("language", "Language", "French", "French"),
                      MergeField.of("vip", "VIP code", "V2", "")))
              .mergeActionId("mergeProfiles")
              .mergeLabel("Merge into P-1021")
              .parameters(Map.of("survivor", "P-1021", "duplicate", "P-3388"))
              .build();

  @SuppressWarnings("unchecked")
  public MergeProfiles mergeProfiles(HttpRequest httpRequest) {
    var parameters = httpRequest.runActionRq().parameters();
    var merged = (Map<String, Object>) parameters.get("_merged");
    result =
        "Profile "
            + parameters.get("duplicate")
            + " merged into "
            + parameters.get("survivor")
            + " — email "
            + merged.get("email")
            + ", phone "
            + merged.get("phone");
    return this;
  }
}
