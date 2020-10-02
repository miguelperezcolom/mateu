package io.mateu.mdd.vaadin.controllers.firstLevel;

import io.mateu.mdd.core.app.AbstractArea;
import io.mateu.mdd.core.ui.MDDUIAccessor;
import io.mateu.mdd.shared.interfaces.App;
import io.mateu.mdd.shared.interfaces.IModule;
import io.mateu.mdd.vaadin.components.app.views.firstLevel.AreaComponent;
import io.mateu.mdd.vaadin.controllers.BrokenLinkController;
import io.mateu.mdd.vaadin.controllers.Controller;
import io.mateu.mdd.vaadin.navigation.ViewStack;

public class AreaController extends Controller {
    private final AbstractArea area;

    public AreaController(ViewStack stack, String path, AbstractArea area) {
        super();
        this.area = area;
        register(stack, path, new AreaComponent(area));
    }

    @Override
    public void apply(ViewStack stack, String path, String step, String cleanStep, String remaining) throws Throwable {
        if (!"".equals(step)) {
            App app = MDDUIAccessor.getApp();
            IModule m = app.getModule(path + "/" + step);
            Controller controller = null;
            if (m != null) {
                controller = new ModuleController(stack, path + "/" + step, m);
            } else {
                controller = new BrokenLinkController(stack, path + "/" + step);
            }
            controller.next(stack, path, step, remaining);
        }
    }
}
