package io.mateu.util.app;


public class ShutdownHookThread implements Runnable {


    private final MateuApplication app;

    public ShutdownHookThread(MateuApplication context) {
        this.app = context;
    }

    @Override
    public void run() {
        app.destroy();
    }
}
