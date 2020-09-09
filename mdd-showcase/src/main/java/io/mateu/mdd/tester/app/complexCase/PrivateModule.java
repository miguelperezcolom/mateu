package io.mateu.mdd.tester.app.complexCase;

import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.app.MDDOpenEditorAction;
import io.mateu.mdd.core.app.MenuEntry;
import io.mateu.mdd.core.model.config.AppConfig;

import java.util.Arrays;
import java.util.List;

public class PrivateModule extends AbstractModule {
    @Override
    public String getName() {
        return "Private module";
    }

    @Override
    public List<MenuEntry> buildMenu() {
        return Arrays.asList(new MDDOpenEditorAction("AppConfig", AppConfig.class, 1l));
    }
}
