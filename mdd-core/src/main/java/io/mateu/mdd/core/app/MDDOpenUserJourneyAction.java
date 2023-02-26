package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.UserJourney;

public class MDDOpenUserJourneyAction extends AbstractAction {

    private final UserJourney userJourney;

    public MDDOpenUserJourneyAction(String caption, UserJourney userJourney) {
        super(caption);
        this.userJourney = userJourney;
    }

    public UserJourney getUserJourney() {
        return userJourney;
    }
}
