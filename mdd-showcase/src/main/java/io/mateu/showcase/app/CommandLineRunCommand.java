package io.mateu.showcase.app;

import io.mateu.mdd.core.app.MateuApplication;

public class CommandLineRunCommand {

    public static void main(String[] args) {

        new MateuApplication().run(() -> System.out.println("comando ejecutado!"));

    }

}
