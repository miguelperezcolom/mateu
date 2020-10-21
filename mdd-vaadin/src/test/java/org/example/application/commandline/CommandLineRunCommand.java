package org.example.application.commandline;


import io.mateu.util.app.MateuApplication;

public class CommandLineRunCommand {

    public static void main(String[] args) {

        new MateuApplication().run(() -> System.out.println("comando ejecutado!"));

    }

}
