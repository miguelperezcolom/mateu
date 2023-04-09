package io.mateu.remote.application;

import io.mateu.remote.dtos.View;
import org.springframework.stereotype.Service;

@Service
public class MateuRemoteClient {
    public View getView(String remoteBaseUrl, String remoteJourneyId, String stepId) {
        return View.builder().build();
    }

    public void startJourney(String remoteBaseUrl, String journeyTypeId, String journeyId) {
    }
}
