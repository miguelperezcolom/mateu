package io.mateu.remote.dtos;

import lombok.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Journey {

    private String type;

    private JourneyStatus status;

    private String statusMessage;

    private String currentStepId;

    private String currentStepDefinitionId;

}
