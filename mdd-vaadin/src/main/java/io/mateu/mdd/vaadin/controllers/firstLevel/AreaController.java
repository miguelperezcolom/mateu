package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.MateuUI;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class AreaController extends Controller {
    private final AbstractArea area;

    public AreaController(AbstractArea area) {
        super();
        this.area = area;
        if (area != null) {
            if (MateuUI.get() != null) MateuUI.get().setArea(area);
        }
    }

    @Override
    public Object apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            App app = MDDUIAccessor.getApp();
            IModule m = app.getModule(path + "/" + step);
            return m;
        }
        return null;
    }
}
