package io.mateu.remote.dtos;

import lombok.*;

import java.util.List;

@Data@Builder@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Journey {

    private String type;

    private JourneyStatus status;

    private String statusMessage;

    private String currentStepId;

    private String currentStepDefinitionId;

}
