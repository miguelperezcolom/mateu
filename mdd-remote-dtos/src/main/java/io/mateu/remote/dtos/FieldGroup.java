package io.mateu.remote.dtos;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FieldGroup {

    private String caption;

    private List<Field> fields = new ArrayList<>();
}
