package io.mateu.showcase.app;

import io.mateu.showcase.domain.MyAppListener;
import org.jboss.weld.environment.se.Weld;
import org.jboss.weld.environment.se.WeldContainer;

public class CommandLineWithCDI {

    public static void main(String[] args) {
        Weld weld = new Weld();

        try (WeldContainer container = weld.initialize()) {

            container.select(MyAppListener.class).get();

        }
        weld.shutdown();
        System.exit(0);
    }

}
