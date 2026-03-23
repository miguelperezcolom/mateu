package io.mateu.mdd.specdrivengenerator.application.query.dtos;

import java.util.List;

public record AggregateDto(String id, String name, List<FieldDto> fields, List<InvariantDto> invariants) {
}
