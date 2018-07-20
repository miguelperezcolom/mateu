package io.mateu.mdd.tester.app;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.app.MDDExecutionContext;
import io.mateu.mdd.core.app.MenuEntry;

import java.util.Arrays;
import java.util.List;

public class PrivateModule extends AbstractModule {
    @Override
    public String getName() {
        return "Private module";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        return Arrays.asList(new AbstractAction("Test") {
            @Override
            public void run(MDDExecutionContext context) {
                MDD.alert("Hello private");
            }
        });
    }
}
