package io.mateu.dtos;

import java.util.List;
import java.util.Map;
import lombok.Builder;

/** Compare and merge: records side by side, a pick per field, a merge action. */
@Builder
public record RecordMergeDto(
    String title,
    List<MergeRecordDto> records,
    List<MergeFieldDto> fields,
    String mergeActionId,
    String mergeLabel,
    Map<String, Object> parameters,
    boolean differencesOnly)
    implements ComponentMetadataDto {

  public RecordMergeDto {
    records = records != null ? List.copyOf(records) : List.of();
    fields = fields != null ? List.copyOf(fields) : List.of();
  }
}
