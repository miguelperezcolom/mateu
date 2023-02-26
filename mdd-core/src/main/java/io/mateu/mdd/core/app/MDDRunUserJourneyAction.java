package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.UserJourney;
import io.mateu.remote.dtos.Action;

public class MDDRunUserJourneyAction extends AbstractAction {

    private final String baseUrl;
    private String journeyId;
    private String stepId;
    private final String actionId;
    private final Object stepFormInstance;

    public MDDRunUserJourneyAction(String baseUrl, String journeyId, String stepId, String actionId, Object stepFormInstance) {
        super(actionId);
        this.baseUrl = baseUrl;
        this.journeyId = journeyId;
        this.stepId = stepId;
        this.actionId = actionId;
        this.stepFormInstance = stepFormInstance;
    }

    public void setJourneyId(String journeyId) {
        this.journeyId = journeyId;
    }

    public void setStepId(String stepId) {
        this.stepId = stepId;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getJourneyId() {
        return journeyId;
    }

    public String getStepId() {
        return stepId;
    }

    public String getActionId() {
        return actionId;
    }

    public Object getStepFormInstance() {
        return stepFormInstance;
    }

}
