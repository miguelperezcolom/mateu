package io.mateu.mdd.vaadin.components.app.views.firstLevel;

import com.google.common.base.Strings;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.app.AbstractModule;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.components.views.AbstractViewComponent;

public class FakeComponent extends AbstractViewComponent {

    @Override
    public String toString() {
        return getTitle();
    }

    public FakeComponent(String title) {
        setTitle(title);
    }

    @Override
    public AbstractViewComponent build() throws Exception {
        return this;
    }
}
