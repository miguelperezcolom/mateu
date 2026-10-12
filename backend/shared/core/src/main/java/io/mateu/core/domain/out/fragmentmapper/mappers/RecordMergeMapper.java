package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MergeFieldDto;
import io.mateu.dtos.MergeRecordDto;
import io.mateu.dtos.RecordMergeDto;
import io.mateu.uidl.data.MergeField;
import io.mateu.uidl.data.MergeRecord;
import io.mateu.uidl.data.RecordMerge;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Maps a {@link RecordMerge}. The server settles what every renderer would otherwise compute on its
 * own (and could compute differently): each row is padded/cut to one value per record, a row {@code
 * differs} when its values are not all the same (compared as trimmed text, null = blank), and the
 * value picked to begin with is the declared one or the first record with a non-blank value.
 */
public class RecordMergeMapper {

  public static ClientSideComponentDto mapRecordMergeToDto(RecordMerge merge) {
    var records = merge.records() != null ? merge.records() : List.<MergeRecord>of();
    var recordIds =
        records.stream().map(r -> r.id() != null ? r.id() : "record" + records.indexOf(r)).toList();
    return new ClientSideComponentDto(
        RecordMergeDto.builder()
            .title(merge.title())
            .records(
                records.stream()
                    .map(
                        r ->
                            new MergeRecordDto(
                                recordIds.get(records.indexOf(r)),
                                r.label() != null && !r.label().isBlank()
                                    ? r.label()
                                    : "Record " + (records.indexOf(r) + 1),
                                r.caption()))
                    .toList())
            .fields(
                merge.fields() == null
                    ? List.of()
                    : merge.fields().stream().map(f -> field(f, recordIds)).toList())
            .mergeActionId(merge.mergeActionId())
            .mergeLabel(
                merge.mergeLabel() != null && !merge.mergeLabel().isBlank()
                    ? merge.mergeLabel()
                    : "Merge")
            .parameters(merge.parameters())
            .differencesOnly(merge.differencesOnly())
            .build(),
        merge.id(),
        List.of(),
        merge.style(),
        merge.cssClasses(),
        null);
  }

  static MergeFieldDto field(MergeField field, List<String> recordIds) {
    var values = new ArrayList<Object>(recordIds.size());
    for (int i = 0; i < recordIds.size(); i++) {
      values.add(i < field.values().size() ? field.values().get(i) : null);
    }
    var texts = values.stream().map(RecordMergeMapper::text).toList();
    boolean differs = texts.stream().distinct().count() > 1;
    String chosen = field.chosen();
    if (chosen == null || !recordIds.contains(chosen)) {
      chosen = recordIds.isEmpty() ? null : recordIds.get(0);
      for (int i = 0; i < texts.size(); i++) {
        if (!texts.get(i).isEmpty()) {
          chosen = recordIds.get(i);
          break;
        }
      }
    }
    return new MergeFieldDto(
        field.fieldId(),
        field.label() != null && !field.label().isBlank()
            ? field.label()
            : io.mateu.uidl.Humanizer.toUpperCaseFirst(Objects.toString(field.fieldId(), "")),
        values,
        chosen,
        field.editable(),
        differs);
  }

  private static String text(Object value) {
    return value == null ? "" : value.toString().trim();
  }
}
