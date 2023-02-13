package io.mateu.remote.dtos;

import lombok.Data;

import java.util.List;

@Data
public class Form implements ViewMetadata {

    private String caption;

    private List<Section> sections;

    private List<Action> actions;

    private List<Action> mainActions;

}
