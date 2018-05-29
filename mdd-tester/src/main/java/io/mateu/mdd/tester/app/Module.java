package io.mateu.mdd.tester.app;

import io.mateu.mdd.core.MDD;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.model.config.AppConfig;
import io.mateu.mdd.tester.model.basic.BasicFields;

import java.util.ArrayList;
import java.util.List;

public class Module extends AbstractModule {
    @Override
    public String getName() {
        return "Module";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        List<MenuEntry> m = new ArrayList<>();

        m.add(new AbstractAction("Alert") {
            @Override
            public void run() {
                MDD.alert("Hola!");
            }
        });

        m.add(new MDDOpenEditorAction("AppConfig", AppConfig.class, 1l));

        m.add(new MDDAction("Basic fields", BasicFields.class));


        return m;
    }

}
