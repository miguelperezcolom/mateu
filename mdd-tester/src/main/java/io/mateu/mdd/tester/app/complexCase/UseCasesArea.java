package io.mateu.mdd.tester.app.complexCase;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;

import java.util.Arrays;
import java.util.List;

public class UseCasesArea extends AbstractArea {

    public UseCasesArea() {
        super("Use cases");
    }

    @Override
    public List<AbstractModule> buildModules() {
        return Arrays.asList(new UseCasesModule());
    }

    @Override
    public boolean isPublicAccess() {
        return true;
    }

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.SUITCASE;
    }
}
