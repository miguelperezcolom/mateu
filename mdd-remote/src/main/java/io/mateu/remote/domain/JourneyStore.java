package io.mateu.remote.domain;

import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;

public interface JourneyStore {

    void putJourney(String journeyId, Journey journey);

    Journey getJourney(String journeyId);

    void putStep(String stepId, Step step);

    Step getStep(String stepId);


    void putViewInstance(String stepId, Object viewInstance);

    Object getViewInstance(String journeyId, String stepId);


    void putJourneyPerType(String journeyTypeId, Journey journey, Object formInstance);

    Journey getJourneyPerType(String journeyTypeId);

    Object getFormInstancePerType(String journeyTypeId);
}