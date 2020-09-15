package io.mateu.mdd.core.model;

public class ShutdownHookThread implements Runnable {


    private final BaseAppContext context;

    public ShutdownHookThread(BaseAppContext context) {
        this.context = context;
    }

    @Override
    public void run() {
        context.destroyed();
    }
}
