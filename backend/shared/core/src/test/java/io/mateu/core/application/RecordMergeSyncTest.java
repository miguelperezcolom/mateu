package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MergeFieldDto;
import io.mateu.dtos.RecordMergeDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MergeField;
import io.mateu.uidl.data.MergeRecord;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.RecordMerge;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Compare and merge: the server settles what every renderer needs — one value per record per row,
 * whether the row differs, the record picked to begin with, the default labels — and the merge
 * action is advertised (it is named by the component tree) and receives the picks.
 */
class RecordMergeSyncTest {

  static String lastMerged;

  @SuppressWarnings("unused")
  @UI("/record-merge")
  @Title("Merge profiles")
  public static class MergeProfiles {

    @Label("")
    Callable<Component> merge =
        () ->
            RecordMerge.builder()
                .title("Duplicate guests")
                .records(
                    List.of(
                        new MergeRecord("a", "Profile 1021", "12 stays"),
                        new MergeRecord("b", "Profile 3388")))
                .fields(
                    List.of(
                        MergeField.of("name", "Name", "Ana García", "Ana García"),
                        MergeField.of("email", "Email", null, "ana@example.com"),
                        MergeField.of("phone", null, "+34 600 000 000", "+34 611 111 111")
                            .withEditable(true)
                            .withChosen("b"),
                        // a short row: padded with a blank value for the second record
                        new MergeField("vip", "VIP", List.of(true), null, false)))
                .mergeActionId("mergeProfiles")
                .parameters(Map.of("survivor", "a"))
                .build();

    public Message mergeProfiles(HttpRequest httpRequest) {
      var parameters = httpRequest.runActionRq().parameters();
      lastMerged = String.valueOf(parameters.get("_merged"));
      return new Message("merged " + parameters.get("survivor"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(MergeProfiles.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private RecordMergeDto merge() {
    var increment = mateu.sync("/record-merge");
    var merges =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), RecordMergeDto.class);
    assertThat(merges).hasSize(1);
    return merges.get(0);
  }

  @Test
  void recordsAndFieldsTravelWithDifferencesAndDefaultPicks() {
    var merge = merge();
    assertThat(merge.title()).isEqualTo("Duplicate guests");
    assertThat(merge.mergeLabel()).isEqualTo("Merge");
    assertThat(merge.parameters()).containsEntry("survivor", "a");
    assertThat(merge.records()).extracting(r -> r.id()).containsExactly("a", "b");
    assertThat(merge.records().get(0).caption()).isEqualTo("12 stays");

    var byId =
        merge.fields().stream()
            .collect(java.util.stream.Collectors.toMap(f -> f.fieldId(), f -> f));
    MergeFieldDto name = byId.get("name");
    assertThat(name.differs()).isFalse();
    assertThat(name.chosen()).isEqualTo("a");

    // the first record has no email: the first NON-BLANK value is picked
    MergeFieldDto email = byId.get("email");
    assertThat(email.differs()).isTrue();
    assertThat(email.chosen()).isEqualTo("b");

    // a declared pick wins; a missing label is the field id humanized
    MergeFieldDto phone = byId.get("phone");
    assertThat(phone.chosen()).isEqualTo("b");
    assertThat(phone.editable()).isTrue();
    assertThat(phone.label()).isEqualTo("Phone");

    MergeFieldDto vip = byId.get("vip");
    assertThat(vip.values()).hasSize(2);
    assertThat(vip.differs()).isTrue();
  }

  @Test
  void theMergeActionIsAdvertisedAndReceivesThePicks() {
    var increment = mateu.sync("/record-merge");
    var page = (ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(page.actions()).extracting(a -> a.id()).contains("mergeProfiles");

    var result =
        mateu.run(
            RunActionRqDto.builder()
                .route("/record-merge")
                .serverSideType(MergeProfiles.class.getName())
                .actionId("mergeProfiles")
                .componentState(Map.of())
                .parameters(
                    Map.of(
                        "survivor",
                        "a",
                        "_merged",
                        Map.of("email", "ana@example.com"),
                        "_choices",
                        Map.of("email", "b")))
                .build());
    assertThat(result.messages()).extracting(m -> m.text()).contains("merged a");
    assertThat(lastMerged).contains("ana@example.com");
  }
}
