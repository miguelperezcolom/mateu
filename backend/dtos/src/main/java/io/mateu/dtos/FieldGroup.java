package io.mateu.dtos;

import java.util.List;

public record FieldGroup(
        String id,
        String caption,
        List<FieldGroupLine> lines) {

}