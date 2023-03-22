package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.JourneyRunner;

public class MDDOpenUserJourneyAction extends AbstractAction {

    private final JourneyRunner userJourney;

    public MDDOpenUserJourneyAction(String caption, JourneyRunner userJourney) {
        super(caption);
        this.userJourney = userJourney;
    }

    public JourneyRunner getUserJourney() {
        return userJourney;
    }
}
