package io.mateu.remote.dtos;

import lombok.*;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Step {

    private String id;

    private String name;

    private String type;

    private View view;

}
