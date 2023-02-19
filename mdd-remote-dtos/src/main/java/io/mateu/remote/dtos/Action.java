package io.mateu.remote.dtos;

import lombok.*;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Action {

    private String id;

    private String caption;

    private ActionType type;

}
