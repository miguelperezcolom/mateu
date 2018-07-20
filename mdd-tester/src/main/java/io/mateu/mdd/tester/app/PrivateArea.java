package io.mateu.mdd.tester.app;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;

import java.util.Arrays;
import java.util.List;

public class PrivateArea extends AbstractArea {

    public PrivateArea() {
        super("Private area");
    }

    @Override
    public VaadinIcons getIcon() {
        return VaadinIcons.DOLLAR;
    }

    @Override
    public List<AbstractModule> buildModules() {
        return Arrays.asList(new PrivateModule());
    }
}
