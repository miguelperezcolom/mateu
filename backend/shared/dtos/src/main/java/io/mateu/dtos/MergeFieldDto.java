package io.mateu.dtos;

import java.util.List;

/**
 * A row of a {@link RecordMergeDto}: one value per record; {@code differs} when they are not all
 * the same; {@code chosen} = the record picked to begin with (never null on the wire).
 */
public record MergeFieldDto(
    String fieldId,
    String label,
    List<Object> values,
    String chosen,
    boolean editable,
    boolean differs) {}
