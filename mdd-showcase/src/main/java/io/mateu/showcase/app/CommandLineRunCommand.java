package io.mateu.showcase.app;

import io.mateu.mdd.core.app.MateuApplication;
import io.mateu.mdd.shared.Command;

public class CommandLineRunCommand {

    public static void main(String[] args) {

        new MateuApplication().run(new Command() {
            @Override
            public void run() {
                System.out.println("comando ejecutado!");
            }
        });

    }

}
