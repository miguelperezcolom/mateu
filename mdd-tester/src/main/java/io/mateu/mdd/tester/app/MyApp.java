package io.mateu.mdd.tester.app;



import io.mateu.mdd.core.app.AbstractApplication;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;

import java.util.Arrays;
import java.util.List;

public class MyApp extends AbstractApplication {
    public String getName() {
        return "My Appp";
    }

    public List<AbstractArea> buildAreas() {
        return Arrays.asList((AbstractArea) new AbstractArea("Area 1") {
            @Override
            public List<AbstractModule> buildModules() {
                return Arrays.asList(new Module());
            }

            @Override
            public boolean isPublicAccess() {
                return true;
            }
        });
    }
}
