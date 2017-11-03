package io.mateu.mdd.app;

import io.mateu.ui.core.client.app.AbstractApplication;
import io.mateu.ui.core.client.app.AbstractArea;
import io.mateu.ui.core.client.app.AbstractModule;

import java.util.Arrays;
import java.util.List;

public class MyApp extends AbstractApplication {
    public String getName() {
        return "My Appp";
    }

    public List<AbstractArea> getAreas() {
        return Arrays.asList((AbstractArea) new AbstractArea("Area 1") {
            @Override
            public List<AbstractModule> getModules() {
                return Arrays.asList(new Module());
            }
        });
    }
}
