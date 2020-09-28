package io.mateu.mdd.core.app;

public abstract class MDDRunnableAction extends AbstractAction {

    public MDDRunnableAction(String caption) {
        super(caption);
    }

    public abstract void run() throws Throwable;

}
