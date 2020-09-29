package io.mateu.mdd.vaadin.controllers;

import com.vaadin.ui.Component;
import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.components.app.views.AreaComponent;

public class AreaController extends Controller {
    private final AbstractArea area;

    public AreaController(AbstractArea area) {
        super();
        this.area = area;
    }

    @Override
    public Component apply(String path, String step, String remaining) throws Exception {
        if ("".equals(step)) {
            return new AreaComponent(area);
        } else {
            App app = MDDUIAccessor.getApp();
            IModule m = app.getModule(path + "/" + step);
            Controller controller = null;
            if (m != null) {
                controller = new ModuleController(m);
            } else {
                controller = new BrokenLinkController();
            }
            return controller.next(path, step, remaining);
        }
    }
}
