package com.example.demoremote.domains.journeyStore;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.mdd.shared.annotations.Json;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.TextArea;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter@Setter@ReadOnly@NoArgsConstructor
public class JourneyContainerEditor {


    public JourneyContainerEditor(JourneyContainer container) throws Exception {
        journeyId = container.getJourneyId();
        journeyTypeId = container.getJourneyTypeId();
        remoteBaseUrl = container.getRemoteBaseUrl();
        journeyClass = container.getJourneyClass() != null?container.getJourneyClass().toString():null;
        journeyData = Helper.toJson(container.getJourneyData());
        journey = Helper.toJson(container.getJourney());
        steps = Helper.toJson(container.getSteps());
        initialStep = Helper.toJson(container.getInitialStep());
        created = container.getCreated();
        lastAccess = container.getLastAccess();
        lastUsedFilters = Helper.toJson(container.getLastUsedFilters());
        lastUsedSorting = Helper.toJson(container.getLastUsedSorting());
    }

    @Id
    private String journeyId;

    private String journeyTypeId;

    private String remoteBaseUrl;

    private String remoteJourneyTypeId;

    private String journeyClass;

    @Json
    private String journeyData;

    @Json
    private String journey;

    @Json
    private String steps;

    @Json
    private String initialStep;

    private LocalDateTime created = LocalDateTime.now();

    private LocalDateTime lastAccess = LocalDateTime.now();

    @Json
    private String lastUsedFilters;

    @Json
    private String lastUsedSorting;
}
