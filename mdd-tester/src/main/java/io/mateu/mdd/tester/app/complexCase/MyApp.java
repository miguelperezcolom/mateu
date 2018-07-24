package io.mateu.mdd.tester.app.complexCase;



import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.BaseMDDApp;

import java.util.Arrays;
import java.util.List;

public class MyApp extends BaseMDDApp {
    public String getName() {
        return "My Appp";
    }

    public List<AbstractArea> buildAreas() {
        return Arrays.asList(new MainArea(), new UseCasesArea(), new PrivateArea());
    }
}
