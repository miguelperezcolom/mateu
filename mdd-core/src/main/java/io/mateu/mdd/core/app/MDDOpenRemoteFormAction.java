package io.mateu.mdd.core.app;

import io.mateu.mdd.shared.interfaces.RemoteForm;

public class MDDOpenRemoteFormAction extends AbstractAction {

    private final RemoteForm remoteForm;

    public MDDOpenRemoteFormAction(String caption, RemoteForm remoteForm) {
        super(caption);
        this.remoteForm = remoteForm;
    }

    public RemoteForm getRemoteForm() {
        return remoteForm;
    }
}
