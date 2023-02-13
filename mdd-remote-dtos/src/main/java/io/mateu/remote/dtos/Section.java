package io.mateu.remote.dtos;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class Section {

    private String caption;

    private List<Action> actions = new ArrayList<>();

    private List<FieldGroup> fieldGroups = new ArrayList<>();
}
