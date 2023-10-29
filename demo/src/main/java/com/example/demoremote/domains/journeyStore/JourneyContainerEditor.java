package com.example.demoremote.domains.journeyStore;

import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.mdd.shared.annotations.Json;
import io.mateu.mdd.shared.annotations.ReadOnly;
import io.mateu.mdd.shared.annotations.TextArea;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
import io.mateu.util.Serializer;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Getter@Setter@ReadOnly@RequiredArgsConstructor
public class JourneyContainerEditor {

    final Serializer serializer;

    public void load(JourneyContainer container) throws Exception {
        journeyId = container.getJourneyId();
        journeyTypeId = container.getJourneyTypeId();
        remoteBaseUrl = container.getRemoteBaseUrl();
        journeyClass = container.getJourneyClass() != null?container.getJourneyClass().toString():null;
        journeyData = serializer.toJson(container.getJourneyData());
        journey = serializer.toJson(container.getJourney());
        steps = serializer.toJson(container.getSteps());
        initialStep = serializer.toJson(container.getInitialStep());
        created = container.getCreated();
        lastAccess = container.getLastAccess();
        lastUsedFilters = serializer.toJson(container.getLastUsedFilters());
        lastUsedSorting = serializer.toJson(container.getLastUsedSorting());
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
