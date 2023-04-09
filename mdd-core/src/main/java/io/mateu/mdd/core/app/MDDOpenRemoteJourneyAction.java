package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.RemoteJourney;

public class MDDOpenRemoteJourneyAction extends AbstractAction {

    private final RemoteJourney remoteJourney;

    public MDDOpenRemoteJourneyAction(String caption, RemoteJourney remoteJourney) {
        super(caption);
        this.remoteJourney = remoteJourney;
    }

    public RemoteJourney getRemoteJourney() {
        return remoteJourney;
    }
}
