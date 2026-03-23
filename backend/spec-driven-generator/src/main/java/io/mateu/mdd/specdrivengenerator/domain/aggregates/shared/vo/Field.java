package io.mateu.mdd.specdrivengenerator.domain.aggregates.shared.vo;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.FieldTypeDto;

public record Field(String name, String label, FieldTypeDto type, String help,
                    String valueObjectId,
                    String entityId,
                    boolean mandatory, boolean readonly, boolean visible,
                    boolean editable, boolean searchable, boolean filterable) {
}
