package io.mateu.showcase.app;

import io.mateu.mdd.core.app.MateuApplication;
import org.jboss.weld.environment.se.Weld;
import org.jboss.weld.environment.se.WeldContainer;

public class CommandLineWithCDI {

    public static void main(String[] args) {
        Weld weld = new Weld();

        try (WeldContainer container = weld.initialize()) {

                container.select(MateuApplication.class).get();

        }
        //weld.shutdown(); // no es necesario. tiene un shutdown hook
    }

}
