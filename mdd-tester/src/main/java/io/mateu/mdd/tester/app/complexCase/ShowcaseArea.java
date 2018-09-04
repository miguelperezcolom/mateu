package io.mateu.mdd.tester.app.complexCase;

import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;

import java.util.Arrays;
import java.util.List;

public class ShowcaseArea extends AbstractArea {

    public ShowcaseArea() {
        super("Showcase area");
        defaultAction = new MDDOpenCRUDAction("Welcome page",
                BasicFieldsDemoEntity.class);
    }

    @Override
    public List<AbstractModule> buildModules() {
        return Arrays.asList(new MainModule(), new DeepMenusModule());
    }

    @Override
    public boolean isPublicAccess() {
        return true;
    }

}
