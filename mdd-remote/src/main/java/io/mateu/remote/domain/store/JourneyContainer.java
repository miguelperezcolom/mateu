package io.mateu.remote.domain.store;

import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import lombok.*;

import jakarta.persistence.Id;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyContainer implements Serializable {

    @Id
    private String journeyId;

    private String journeyTypeId;

    private String remoteBaseUrl;

    private String remoteJourneyId;

    private Class journeyClass;

    private Map<String, Object> journeyData;

    private Journey journey;

    private Map<String, Step> steps;

    private Step initialStep;

    private LocalDateTime created = LocalDateTime.now();

    private LocalDateTime lastAccess = LocalDateTime.now();

    public void reset() {
        journey.setCurrentStepId(initialStep.getId());
        journey.setCurrentStepDefinitionId(initialStep.getType());
    }
}
