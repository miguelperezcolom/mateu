package io.mateu.mdd.specdrivengenerator.application.query.dtos;

public record FieldDto(String name, String label, FieldTypeDto type, String help,
                       String valueObjectId,
                       String entityId,
                       boolean mandatory, boolean readonly, boolean visible,
                       boolean editable, boolean searchable, boolean filterable) {
}
