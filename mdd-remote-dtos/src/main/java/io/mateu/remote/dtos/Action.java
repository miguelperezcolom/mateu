package io.mateu.remote.dtos;

import lombok.Data;

@Data
public class Action {

    private String id;

    private String caption;

    private ActionType type;

}
