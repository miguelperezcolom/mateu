package io.mateu.showcase.app;

import io.mateu.showcase.domain.MyAppListener;

public class CommandLine {

    public static void main(String[] args) {

        try {
            new MyAppListener();
        } catch (Throwable throwable) {
            throwable.printStackTrace();
        }

        try {
            Thread.sleep(1 * 15 * 1000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
        System.out.println("fin!");

        System.exit(0);
    }

}
