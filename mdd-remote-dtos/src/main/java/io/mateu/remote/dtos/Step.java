package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;
import java.util.Map;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Step {

    private String id;

    private String name;

    private String type;

    private View view;

    private Map<String, Object> data;

    private List<Rule> rules;

    private String previousStepId;

}
