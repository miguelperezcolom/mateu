package io.mateu.mdd.vaadin;

import com.google.auto.service.AutoService;
import com.vaadin.ui.UI;
import io.mateu.mdd.shared.ui.IMDDUI;
import io.mateu.mdd.shared.ui.IMDDUIInjector;

@AutoService(IMDDUIInjector.class)
public class MDDUIInjector implements IMDDUIInjector {
    @Override
    public IMDDUI get() {
        UI ui = UI.getCurrent();
        return ui != null && ui instanceof IMDDUI ? (IMDDUI) ui :null;
    }
}
