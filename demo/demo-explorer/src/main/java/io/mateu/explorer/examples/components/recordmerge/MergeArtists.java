package io.mateu.explorer.examples.components.recordmerge;

import io.mateu.uidl.data.MergeField;
import io.mateu.uidl.data.MergeRecord;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.RecordMerge;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Compare and merge two records: one column per record, one row per field; rows that differ are
 * highlighted, each row is a pick (and an editable one also takes a typed value). The merge button
 * runs {@code mergeActionId} with {@code _merged} (field → value) and {@code _choices} (field →
 * record id, or "custom") next to the component's {@code parameters}.
 */
public class MergeArtists implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return RecordMerge.builder()
        .title("Artist records A-104 and A-871 look like the same person")
        .records(
            List.of(
                new MergeRecord("A-104", "Record A-104", "Created 2014 · 37 works"),
                new MergeRecord("A-871", "Record A-871", "Created last week · 1 work")))
        .fields(
            List.of(
                MergeField.of("name", "Name", "Vincent van Gogh", "Vincent Van Gogh"),
                MergeField.of("born", "Born", "1853-03-30", "1853-03-30"),
                MergeField.of("birthplace", "Birthplace", "Zundert", "Zundert, Netherlands").withChosen("A-871"),
                MergeField.of("movement", "Movement", "Post-Impressionism", null),
                MergeField.of("wiki", "Wikidata id", null, "Q5582").withEditable(true)))
        .mergeActionId("mergeArtists")
        .mergeLabel("Merge into A-104")
        .parameters(Map.of("survivor", "A-104", "duplicate", "A-871"))
        .build();
  }

  public Message mergeArtists(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    return Message.success("Merged " + p.get("duplicate") + " into " + p.get("survivor") + ": " + p.get("_merged"));
  }
}
