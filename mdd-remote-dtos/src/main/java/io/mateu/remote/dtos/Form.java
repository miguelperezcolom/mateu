package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Form implements ViewMetadata {

    private final ViewMetadataType type = ViewMetadataType.Form;

    private String title;

    private String subtitle;

    private List<Section> sections;

    private List<Action> actions;

    private List<Action> mainActions;

}
