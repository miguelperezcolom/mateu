package io.mateu.mdd.core.model;

public class ShutdownHookThread implements Runnable {


    private final BaseAppContextListener context;

    public ShutdownHookThread(BaseAppContextListener context) {
        this.context = context;
    }

    @Override
    public void run() {
        context.destroyed();
    }
}
