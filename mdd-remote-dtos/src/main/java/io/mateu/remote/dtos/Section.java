package io.mateu.remote.dtos;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Section {

    private String caption;

    private List<Action> actions = new ArrayList<>();

    private List<FieldGroup> fieldGroups = new ArrayList<>();
}
