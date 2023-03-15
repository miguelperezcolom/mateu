package io.mateu.remote.infra;

import io.mateu.reflection.ReflectionHelper;
import io.mateu.remote.domain.JourneyStore;
import io.mateu.remote.domain.commands.StartJourneyCommand;
import io.mateu.remote.dtos.Journey;
import io.mateu.remote.dtos.Step;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MemoryJourneyStore implements JourneyStore {

    private final Map<String, Journey> _journeys = new HashMap<>();

    private final Map<String, Step> _steps = new HashMap<>();

    private final Map<String, Object> _viewInstances = new HashMap<>();

    private final Map<String, Journey> _journeysPerType = new HashMap<>();

    private final Map<String, Object> _formInstancesPerType = new HashMap<>();


    @Override
    public void putJourney(String journeyId, Journey journey) {
        _journeys.put(journeyId, journey);
    }

    @Override
    public Journey getJourney(String journeyId) {
        return _journeys.get(journeyId);
    }

    @Override
    public void putStep(String stepId, Step step) {
        _steps.put(stepId, step);
    }

    @Override
    public Step getStep(String stepId) {
        return _steps.get(stepId);
    }

    @Override
    public void putViewInstance(String stepId, Object viewInstance) {
        _viewInstances.put(stepId, viewInstance);
    }

    @Override
    public Object getViewInstance(String journeyId, String stepId) {
        if (!_viewInstances.containsKey(stepId)) {
            try {
                StartJourneyCommand.builder()
                        .journeyTypeId(journeyId)
                        .journeyId(journeyId)
                        .build().run();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
        return _viewInstances.get(stepId);
    }

    @Override
    public void putJourneyPerType(String journeyTypeId, Journey journey, Object formInstance) {
        _journeysPerType.put(journeyTypeId, journey);
        _formInstancesPerType.put(journeyTypeId, formInstance);
    }

    @Override
    public Journey getJourneyPerType(String journeyTypeId) {
        return _journeysPerType.get(journeyTypeId);
    }

    @Override
    public Object getFormInstancePerType(String journeyTypeId) {
        return _formInstancesPerType.get(journeyTypeId);
    }
}
