package io.mateu.showcase.app;

import io.mateu.mdd.core.app.MateuApplication;

public class CommandLine {

    public static void main(String[] args) {

        MateuApplication app = new MateuApplication().start();

        try {
            Thread.sleep(1 * 15 * 1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("fin!");

        app.destroy();
    }

}
